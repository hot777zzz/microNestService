import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import { LoggerService } from './logger.service';
import { LoggingInterceptor } from './logger.interceptor';
import * as fs from 'fs';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appName =
          configService.get<string>('APP_NAME') || 'nest-micro-service';
        const logDir =
          configService.get<string>('LOG_DIR') || join(process.cwd(), 'logs');
        const logLevel = configService.get<string>('LOG_LEVEL') || 'info';

        // 确保日志目录存在
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        // 创建日志格式
        const logFormat = winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        );

        return {
          level: logLevel,
          transports: [
            // 控制台输出
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike(appName, {
                  colors: true,
                  prettyPrint: true,
                }),
              ),
            }),

            // 信息日志文件 - 按日期轮转
            new winston.transports.DailyRotateFile({
              level: 'info',
              dirname: logDir,
              filename: 'application-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: logFormat,
            }),

            // 错误日志文件 - 按日期轮转
            new winston.transports.DailyRotateFile({
              level: 'error',
              dirname: logDir,
              filename: 'error-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: logFormat,
            }),
          ],
          // 添加异常处理器
          exceptionHandlers: [
            new winston.transports.DailyRotateFile({
              dirname: logDir,
              filename: 'exceptions-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: logFormat,
            }),
          ],
          // 记录未捕获的拒绝（unhandled rejections）
          rejectionHandlers: [
            new winston.transports.DailyRotateFile({
              dirname: logDir,
              filename: 'rejections-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
              format: logFormat,
            }),
          ],
        };
      },
    }),
  ],
  providers: [LoggerService, LoggingInterceptor],
  exports: [WinstonModule, LoggerService, LoggingInterceptor],
})
export class LoggerModule {}
