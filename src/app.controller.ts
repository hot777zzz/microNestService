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
}
