import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';

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
        return influxDB.getWriteApi(org, bucket);
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
        return influxDB.getQueryApi(org);
      },
      inject: ['INFLUXDB_CLIENT', ConfigService],
    },
  ],
  exports: ['INFLUXDB_CLIENT', 'INFLUXDB_WRITE_API', 'INFLUXDB_QUERY_API'],
})
export class InfluxdbModule {}
