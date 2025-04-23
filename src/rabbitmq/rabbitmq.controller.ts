import { Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
@Controller('rabbitmq')
export class RabbitMqController {
  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  @MessagePattern('test')
  test(data: any) {
    console.log('data收到请求', data);
    return 'test';
  }
}
