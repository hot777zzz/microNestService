# NestJS微服务后端

这是一个基于NestJS的微服务架构项目，集成了Winston日志系统和redis，rabbitMQ，influxDB等，用于构建可扩展的微服务应用。

## 功能特点

- 基于NestJS框架的微服务架构
- 使用RabbitMQ进行服务间通信
- 集成Winston强大的日志系统
- TypeORM数据库集成
- 健康检查端点
- 完整的错误处理机制

## 日志系统

本项目实现了一个全面的日志系统，具有以下特点：

1. **分级日志** - 支持error、warn、info、debug、verbose等多个日志级别
2. **日志轮转** - 使用winston-daily-rotate-file进行日志文件轮转
3. **结构化日志** - JSON格式日志，便于后期分析和处理
4. **日志中间件** - 记录所有HTTP请求和响应
5. **日志拦截器** - 记录请求处理时间和异常信息
6. **数据库日志** - 记录数据库操作和错误

### 日志文件位置

日志文件存储在项目根目录的`logs`文件夹中：

- `application-%DATE%.log` - 所有应用日志
- `error-%DATE%.log` - 仅错误日志
- `http-%DATE%.log` - HTTP请求日志

## 安装

```bash
$ npm install
```

## 运行应用

```bash
# 开发模式
$ npm run start:with-logs

# 观察模式
$ npm run start:dev

# 生产模式
$ npm run start:prod
```

## 健康检查

应用提供了健康检查端点，可用于监控应用状态：

```
GET /health
```

返回示例：

```json
{
  "status": "up",
  "uptime": "10m 30s",
  "memory": {
    "rss": "50MB",
    "heapTotal": "20MB",
    "heapUsed": "15MB"
  }
}
```

## 数据库连接

本应用使用TypeORM连接MySQL数据库。请确保在`.env`文件中正确配置数据库连接信息：

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=nestjs
```

## 环境变量

本应用使用以下环境变量进行配置：

```
NODE_ENV=development
PORT=3000
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=nestjs_queue
```

## 故障排除

在使用过程中如遇到问题，请参考[故障排除指南](TROUBLESHOOTING.md)。

## 测试

```bash
# 单元测试
$ npm run test

# e2e测试
$ npm run test:e2e

# 测试覆盖率
$ npm run test:cov
```

## 开发团队

- 团队成员名单

## 许可证

本项目采用[MIT licensed](LICENSE)许可证。
