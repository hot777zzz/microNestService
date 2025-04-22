import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './logger/logger.service';
import { InfluxdbService } from './influxdb/influxdb.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly influxdbService: InfluxdbService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('首页接口被访问', 'AppController');
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    this.logger.log('健康检查接口被访问', 'AppController');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  @Get('test-influxdb')
  async testInfluxDB() {
    this.logger.log('InfluxDB测试接口被访问', 'AppController');
    try {
      await this.influxdbService.writePoint(
        'test_measurement',
        { host: 'server1', region: 'cn-east' },
        { value: Math.random() * 100, message: 'test data' },
      );
      return {
        status: 'success',
        message: 'InfluxDB写入测试成功',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-redis')
  async testRedis(
    @Query('key') key: string = 'test-key',
    @Query('value') value: string = 'test-value',
  ) {
    this.logger.log('Redis测试接口被访问', 'AppController');
    try {
      // 测试PING
      const pingResult = await this.redisService.pingRedis();

      // 测试SET
      await this.redisService.set(key, value, 3600); // 1小时过期

      // 测试GET
      const getResult = await this.redisService.get(key);

      return {
        status: 'success',
        ping: pingResult,
        set: 'OK',
        get: getResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
