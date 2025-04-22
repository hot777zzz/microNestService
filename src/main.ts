import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './logger/logger.interceptor';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // 确保日志目录存在
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`创建日志目录: ${logDir}`);
  }

  console.log('正在启动应用...');
  const app = await NestFactory.create(AppModule);
  console.log('NestJS应用已创建');

  const configService = app.get(ConfigService);

  // 使用Winston作为全局日志提供者
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  console.log('Winston日志系统已设置为全局日志提供者');

  // 添加全局日志拦截器
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  console.log('全局日志拦截器已设置');

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 剥离非DTO中定义的属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 拒绝包含非白名单属性的请求
    }),
  );
  console.log('全局验证管道已设置');

  // 配置微服务
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
    console.log(`RabbitMQ连接配置成功: ${rabbitmqUrl}`);
  } catch (error: any) {
    console.error('RabbitMQ连接配置失败:', error?.message || String(error));
  }

  // 启动微服务
  try {
    await app.startAllMicroservices();
    console.log('所有微服务已启动');
  } catch (error: any) {
    console.error('微服务启动失败:', error?.message || String(error));
  }

  // 启动HTTP服务
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port, () => {
    console.log(`应用已启动，监听端口：${port}`);
  });
}

bootstrap().catch((err) => {
  console.error(
    '应用启动失败:',
    err instanceof Error ? err.message : String(err),
  );
});
