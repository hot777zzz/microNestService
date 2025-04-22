import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const now = Date.now();
    const requestData = {
      body,
      params,
      query,
    };

    this.logger.log(
      `请求 - ${method} ${url}`,
      `LoggingInterceptor.${context.getClass().name}.${context.getHandler().name}`,
    );

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `响应 - ${method} ${url} - ${responseTime}ms`,
          `LoggingInterceptor.${context.getClass().name}.${context.getHandler().name}`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;

        if (error instanceof HttpException) {
          this.logger.error(
            `错误 - ${method} ${url} - ${responseTime}ms - ${error.getStatus()} - ${error.message}`,
            error.stack,
            `LoggingInterceptor.${context.getClass().name}.${context.getHandler().name}`,
          );
        } else {
          this.logger.error(
            `错误 - ${method} ${url} - ${responseTime}ms - ${HttpStatus.INTERNAL_SERVER_ERROR} - ${error.message || '未知错误'}`,
            error.stack || '',
            `LoggingInterceptor.${context.getClass().name}.${context.getHandler().name}`,
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
