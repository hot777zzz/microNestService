import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        try {
          const host = configService.get<string>('REDIS_HOST') || 'localhost';
          const port = configService.get<number>('REDIS_PORT') || 6379;
          const password = configService.get<string>('REDIS_PASSWORD');

          console.log(`正在连接Redis: ${host}:${port}`);

          const client = createClient({
            socket: {
              host,
              port,
            },
            password: password || undefined,
          });

          client.on('error', (err) => {
            console.error('Redis客户端错误:', err);
          });

          await client.connect();
          console.log('Redis客户端连接成功');
          return client;
        } catch (error) {
          console.error(
            'Redis客户端初始化失败:',
            error instanceof Error ? error.message : String(error),
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
