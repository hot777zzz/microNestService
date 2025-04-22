import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MYSQL_HOST');
        const port = configService.get<number>('MYSQL_PORT');
        const username = configService.get<string>('MYSQL_USER');
        const database = configService.get<string>('MYSQL_DATABASE');

        console.log(`尝试连接数据库: ${username}@${host}:${port}/${database}`);

        return {
          type: 'mysql',
          host,
          port,
          username,
          password: configService.get<string>('MYSQL_PASSWORD'),
          database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // 仅在开发环境使用
          logging: ['error', 'warn', 'schema', 'migration'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
