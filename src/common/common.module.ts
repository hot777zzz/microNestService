import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { InfluxdbModule } from './influxdb/influxdb.module';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { ConsulModule } from './consul/consul.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    InfluxdbModule,
    RabbitMqModule,
    ConsulModule,
  ],
})
export class CommonModule {}
