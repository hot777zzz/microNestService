import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RedisModule } from '../redis/redis.module';
import { InfluxdbModule } from '../influxdb/influxdb.module';
import { RabbitMqModule } from '../rabbitmq/rabbitmq.module';
import { ConsulModule } from '../consul/consul.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    InfluxdbModule,
    RabbitMqModule,
    ConsulModule,
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
