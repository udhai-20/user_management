import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './middleware/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UsersService);
  app.use(cookieParser());
  //default admin user creation//
  const existingAdmin = await userService.checkInitialLoading('admin123@gmail.com');
  // console.log('existingAdmin:', existingAdmin);
  if (!existingAdmin) {
    await userService.create({
      firstName:"Admin",
      lastName:"User",
      email: 'admin123@gmail.com',
      password: 'Admin@123',
      role: UserRole.ADMIN,
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }
  
  // Enable CORS?? client url//
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('APi For User Management')
    .setDescription('API for document ingestion')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();