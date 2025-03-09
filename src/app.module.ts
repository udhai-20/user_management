import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { CorsMiddleware } from './middleware/corsMiddleware';
import { LoggerMiddleware } from './logger/logger.Middleware';
import { authMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // ❗ Set to false in production
        ssl: {
            rejectUnauthorized: false, //  Required for Render
        },
    }),
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(CorsMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer.apply(authMiddleware).exclude({ path: '/auth/login', method: RequestMethod.POST },{ path: '/auth/register', method: RequestMethod.POST },{ path: '/auth/logout', method: RequestMethod.POST }).forRoutes("*"); 
  }

}