import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './logger/logger.interceptor';
import * as fs from 'fs';
import * as path from 'path';

// 自定义打印函数
const printBox = (title: string): void => {
  const line = '─'.repeat(Math.max(40, title.length + 4));
  console.log(`┌${line}┐`);
  console.log(`│  ${title.padEnd(line.length - 4)}  │`);
  console.log(`└${line}┘`);
};

const printInfo = (message: string): void => console.log(`[信息] ${message}`);
const printSuccess = (message: string): void =>
  console.log(`[成功] ${message}`);
const printError = (message: string): void =>
  console.error(`[错误] ${message}`);

// 打印所有已注册的路由

export async function bootstrap() {
  printBox('DEMU-CLOUD 服务启动中');

  // 确保日志目录存在
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    printSuccess('创建日志目录成功');
  }

  printInfo('初始化 NestJS 应用...');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  printSuccess('NestJS 应用初始化完成');

  const configService = app.get(ConfigService);

  // 配置 Winston 日志
  printInfo('配置全局日志系统...');
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  printSuccess('全局日志系统配置完成');

  // 配置全局验证管道
  printInfo('配置验证管道...');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  printSuccess('验证管道配置完成');

  // 配置微服务
  printInfo('配置 RabbitMQ 微服务...');
  try {
    const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'nest_micro_service_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
    printSuccess(`RabbitMQ 微服务配置完成 (${rabbitmqUrl})`);
  } catch (error) {
    printError(
      `RabbitMQ 微服务配置失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 启动微服务
  printInfo('启动所有微服务...');
  try {
    await app.startAllMicroservices();
    printSuccess('所有微服务启动成功');
  } catch (error) {
    printError(
      `微服务启动失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 启动 HTTP 服务
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);

  printBox(`服务已启动: http://localhost:${port}`);
}
