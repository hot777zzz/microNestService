import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Point } from '@influxdata/influxdb-client';
import { RedisClientType } from 'redis';
import { WriteApi } from '@influxdata/influxdb-client';
import { ConsulClient } from '../consul/consul.types';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
    @Inject('INFLUXDB_WRITE_API')
    private influxDBWriteApi: WriteApi,
    @Inject('RABBITMQ_CLIENT')
    private rabbitMQClient: ClientProxy,
    @Inject('CONSUL_CLIENT')
    private consulClient: ConsulClient,
    private readonly logger: LoggerService,
  ) {}

  async findAll(): Promise<User[]> {
    this.logger.log('获取所有用户', 'UsersService.findAll');

    // 尝试从Redis缓存获取
    const cachedUsers = await this.redisClient.get('all_users');
    if (cachedUsers) {
      this.logger.log('从缓存获取所有用户', 'UsersService.findAll');
      return JSON.parse(cachedUsers) as User[];
    }

    // 如果缓存不存在，从数据库获取
    this.logger.log('从数据库获取所有用户', 'UsersService.findAll');
    const users = await this.usersRepository.find();

    // 写入缓存
    await this.redisClient.set('all_users', JSON.stringify(users), {
      EX: 3600, // 缓存1小时
    });
    this.logger.log(
      `已更新用户缓存，共 ${users.length} 条记录`,
      'UsersService.findAll',
    );

    // 记录指标到InfluxDB
    const point = new Point('user_query')
      .tag('operation', 'findAll')
      .intField('count', users.length)
      .timestamp(new Date());
    this.influxDBWriteApi.writePoint(point);

    // 通过RabbitMQ发送消息
    this.rabbitMQClient.emit('user_query', {
      operation: 'findAll',
      timestamp: new Date(),
      count: users.length,
    });

    return users;
  }

  async findOne(id: number): Promise<User | null> {
    this.logger.log(`查找用户ID: ${id}`, 'UsersService.findOne');

    // 尝试从Redis缓存获取
    const cachedUser = await this.redisClient.get(`user:${id}`);
    if (cachedUser) {
      this.logger.log(`从缓存获取用户ID: ${id}`, 'UsersService.findOne');
      return JSON.parse(cachedUser) as User;
    }

    // 如果缓存不存在，从数据库获取
    this.logger.log(`从数据库查找用户ID: ${id}`, 'UsersService.findOne');
    const user = await this.usersRepository.findOneBy({ id });

    // 写入缓存
    if (user) {
      await this.redisClient.set(`user:${id}`, JSON.stringify(user), {
        EX: 3600, // 缓存1小时
      });
      this.logger.log(`已更新用户ID: ${id} 的缓存`, 'UsersService.findOne');
    } else {
      this.logger.warn(`未找到用户ID: ${id}`, 'UsersService.findOne');
    }

    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    this.logger.log(`创建新用户: ${userData.username}`, 'UsersService.create');

    const user = this.usersRepository.create(userData);
    await this.usersRepository.save(user);
    this.logger.log(`已创建用户ID: ${user.id}`, 'UsersService.create');

    // 清除缓存
    await this.redisClient.del('all_users');
    this.logger.log('已清除用户列表缓存', 'UsersService.create');

    // 记录到InfluxDB
    const point = new Point('user_operation')
      .tag('operation', 'create')
      .tag('username', user.username)
      .intField('id', user.id)
      .timestamp(new Date());
    this.influxDBWriteApi.writePoint(point);
    this.logger.log('已记录InfluxDB指标', 'UsersService.create');

    // 通过RabbitMQ发送消息
    this.rabbitMQClient.emit('user_created', {
      id: user.id,
      username: user.username,
      timestamp: new Date(),
    });
    this.logger.log('已发送RabbitMQ消息', 'UsersService.create');

    // 注册服务到Consul
    try {
      this.consulClient.agent.service.register(
        {
          name: `user-${user.id}`,
          id: `user-${user.id}`,
          tags: ['user', 'api'],
          address: 'localhost',
          port: 3000,
        },
        (err) => {
          if (err) {
            this.logger.error(
              `注册Consul服务失败: ${err.message}`,
              err.stack,
              'UsersService.create',
            );
          } else {
            this.logger.log(
              `已注册Consul服务: user-${user.id}`,
              'UsersService.create',
            );
          }
        },
      );
    } catch (error) {
      this.logger.error(
        `Consul服务注册异常: ${error.message}`,
        error.stack,
        'UsersService.create',
      );
    }

    return user;
  }
}
