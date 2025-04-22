import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Consul from 'consul';
import { ConsulClient } from './consul.types';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CONSUL_CLIENT',
      useFactory: (configService: ConfigService): ConsulClient => {
        return new Consul({
          host: configService.get<string>('CONSUL_HOST') || 'localhost',
          port: configService.get<number>('CONSUL_PORT') || 8500,
        }) as unknown as ConsulClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['CONSUL_CLIENT'],
})
export class ConsulModule {}
