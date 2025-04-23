import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  async onModuleInit() {
    try {
      // 测试连接
      await this.redisClient.ping();
      this.logger.log('Redis连接成功');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Redis连接失败: ${errorMessage}`);
    }
  }

  async set(key: string, value: string, expiration?: number): Promise<string> {
    try {
      let result: string;
      if (expiration) {
        result = await this.redisClient.set(key, value, { EX: expiration });
      } else {
        result = await this.redisClient.set(key, value);
      }
      this.logger.log(`Redis SET ${key} 成功`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Redis SET ${key} 失败: ${errorMessage}`);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.redisClient.get(key);
      this.logger.log(`Redis GET ${key} 结果: ${result}`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Redis GET ${key} 失败: ${errorMessage}`);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result = await this.redisClient.del(key);
      this.logger.log(`Redis DEL ${key} 结果: ${result}`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Redis DEL ${key} 失败: ${errorMessage}`);
      throw error;
    }
  }
}
