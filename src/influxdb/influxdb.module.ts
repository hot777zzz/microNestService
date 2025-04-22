import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import { InfluxdbService } from './influxdb.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'INFLUXDB_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('INFLUXDB_URL');
        const token = configService.get<string>('INFLUXDB_TOKEN');

        if (!url || !token) {
          throw new Error('Missing InfluxDB configuration');
        }

        console.log(`正在初始化InfluxDB客户端，URL: ${url}`);
        // 确保token以正确的格式传递
        return new InfluxDB({ url, token });
      },
      inject: [ConfigService],
    },
    {
      provide: 'INFLUXDB_WRITE_API',
      useFactory: (
        influxDB: InfluxDB,
        configService: ConfigService,
      ): WriteApi => {
        const org = configService.get<string>('INFLUXDB_ORG');
        const bucket = configService.get<string>('INFLUXDB_BUCKET');

        if (!org || !bucket) {
          throw new Error(
            'Missing InfluxDB organization or bucket configuration',
          );
        }

        console.log(`获取InfluxDB写入API，组织: ${org}, 桶: ${bucket}`);
        const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

        // 设置错误处理回调
        writeApi.useDefaultTags({ host: 'demu-cloud-server' });

        return writeApi;
      },
      inject: ['INFLUXDB_CLIENT', ConfigService],
    },
    {
      provide: 'INFLUXDB_QUERY_API',
      useFactory: (
        influxDB: InfluxDB,
        configService: ConfigService,
      ): QueryApi => {
        const org = configService.get<string>('INFLUXDB_ORG');

        if (!org) {
          throw new Error('Missing InfluxDB organization configuration');
        }

        console.log(`获取InfluxDB查询API，组织: ${org}`);
        return influxDB.getQueryApi(org);
      },
      inject: ['INFLUXDB_CLIENT', ConfigService],
    },
    InfluxdbService,
  ],
  exports: [
    'INFLUXDB_CLIENT',
    'INFLUXDB_WRITE_API',
    'INFLUXDB_QUERY_API',
    InfluxdbService,
  ],
})
export class InfluxdbModule {}
