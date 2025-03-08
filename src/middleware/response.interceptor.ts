import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    ForbiddenException,
    UnauthorizedException,
    ConflictException,
  } from '@nestjs/common';
  import { Observable, map, catchError, throwError } from 'rxjs';
  
  @Injectable()
  export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const httpContext = context.switchToHttp();
      const response = httpContext.getResponse();
  
      return next.handle().pipe(
        map((data) => ({
          statusCode: response.statusCode, // Get status dynamically
          message: data?.message || 'Success',
          data: data?.data || null, 
        })),
        catchError((error) => {
        //   console.error('Error:', error);  
          // Extract status code dynamically from the exception
          const statusCode = error.getStatus ? error.getStatus() : 500;
  
          return throwError(() => ({
            statusCode: statusCode,
            message: error.message || 'Internal Server Error',
            error: error.name || 'Error',
          }));
        })
      );
    }
  }
  