import {
  Controller, Post, Body, UseGuards, Request, Get, Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Auth') //api tag for swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already Exist' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    createUserDto.role = UserRole.VIEWER;
    const response = await this.authService.register(createUserDto);
    return {
      message: "User Created Successfully",
      data: response
    }
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res) {
    const response = await this.authService.login(req.user, res);
    return {
      message: "LoggedIn Successfully",
      data: response
    }
  }

  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @Post('logout')
  async logout(@Res() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return res.json({ message: 'Logged out successfully', data: null });
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiCookieAuth() // Requires cookie in Swagger UI
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('profile')
  getProfile(@Request() req) {
    // console.log('req:', req);
    // console.log('response:', req.headers);
    const response = req.user;
    return {
      message: "User Profile Retrieved successfully",
      data: response
    };
  }
}
