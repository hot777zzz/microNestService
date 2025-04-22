import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import {
  InfluxDB,
  WriteApi,
  QueryApi,
  Point,
} from '@influxdata/influxdb-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InfluxdbService implements OnModuleInit {
  private readonly logger = new Logger(InfluxdbService.name);
  private readonly influxDbUrl: string;
  private readonly influxDbToken: string;
  private readonly org: string;
  private readonly bucket: string;

  constructor(
    @Inject('INFLUXDB_CLIENT')
    private readonly influxDbClient: InfluxDB,
    @Inject('INFLUXDB_WRITE_API')
    private readonly writeApi: WriteApi,
    @Inject('INFLUXDB_QUERY_API')
    private readonly queryApi: QueryApi,
    private readonly configService: ConfigService,
  ) {
    this.influxDbUrl = this.configService.get<string>('INFLUXDB_URL') || '';
    this.influxDbToken = this.configService.get<string>('INFLUXDB_TOKEN') || '';
    this.org = this.configService.get<string>('INFLUXDB_ORG') || '';
    this.bucket = this.configService.get<string>('INFLUXDB_BUCKET') || '';
    this.logger.log(`InfluxDB URL: ${this.influxDbUrl}`);
    this.logger.log(`InfluxDB 组织: ${this.org}, 桶: ${this.bucket}`);
  }

  async onModuleInit() {
    try {
      // 测试连接
      await this.pingInfluxDB();
      this.logger.log('InfluxDB 连接成功');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`InfluxDB 连接失败: ${errorMessage}`);
    }
  }

  private async pingInfluxDB(): Promise<void> {
    try {
      // 使用健康检查API测试连接
      const response = await fetch(`${this.influxDbUrl}/ping`, {
        method: 'GET',
        headers: {
          // InfluxDB v2 使用 Authorization: Token xxx 格式
          Authorization: `Token ${this.influxDbToken}`,
        },
      });

      if (!response.ok) {
        const responseText = await response.text();
        this.logger.error(
          `InfluxDB 响应错误: ${response.status} - ${responseText}`,
        );
        throw new Error(`HTTP错误 ${response.status}: ${responseText}`);
      }

      return;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`无法连接到InfluxDB: ${errorMessage}`);
      throw error;
    }
  }

  // 添加一个简单的写入方法测试
  async writePoint(
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, any>,
  ): Promise<void> {
    try {
      this.logger.log(
        `尝试写入数据点到 ${measurement}，使用的URL: ${this.influxDbUrl}`,
      );
      const point = new Point(measurement);

      // 添加标签
      Object.entries(tags).forEach(([key, value]) => {
        point.tag(key, value);
      });

      // 添加字段
      Object.entries(fields).forEach(([key, value]) => {
        if (typeof value === 'number') {
          point.floatField(key, value);
        } else {
          point.stringField(key, String(value));
        }
      });

      // 打印调试信息
      this.logger.log(`写入数据点到组织: ${this.org}, 桶: ${this.bucket}`);

      this.writeApi.writePoint(point);
      await this.writeApi.flush();
      this.logger.log(`成功写入数据点到 ${measurement}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`写入数据点失败: ${errorMessage}`);
      throw error;
    }
  }
}
