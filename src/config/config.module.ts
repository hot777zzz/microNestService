import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // 应用配置
        APP_PORT: Joi.number().default(3000),
        APP_NAME: Joi.string().required(),

        // 日志配置
        LOG_LEVEL: Joi.string()
          .valid('error', 'warn', 'info', 'debug')
          .default('info'),
        LOG_DIR: Joi.string().default('logs'),

        // MySQL 配置
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),

        // Redis 配置
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),

        // InfluxDB 配置
        INFLUXDB_URL: Joi.string().required(),
        INFLUXDB_TOKEN: Joi.string().required(),
        INFLUXDB_ORG: Joi.string().required(),
        INFLUXDB_BUCKET: Joi.string().required(),

        // RabbitMQ 配置
        RABBITMQ_URL: Joi.string().required(),

        // Consul 配置
        CONSUL_HOST: Joi.string().required(),
        CONSUL_PORT: Joi.number().required(),
      }),
    }),
  ],
})
export class ConfigModule {}
