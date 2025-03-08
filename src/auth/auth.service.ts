import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      // console.log('user:', user);
      const isPasswordValid = await bcrypt.compare(password, user.password);      
      // console.log('isPasswordValid:', isPasswordValid);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any,res:any) {
    const payload = { email: user.email, id: user.id, role: user.role };
    const access_token= this.jwtService.sign(payload);
    res.cookie('access_token', access_token, {
      httpOnly: true, 
      secure: true,    // Requires HTTPS
      sameSite: 'strict', 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    res.send(
      {user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },}
    );
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }
}