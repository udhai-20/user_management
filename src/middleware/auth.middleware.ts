import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class authMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
//    console.log(' req.headers:',  req.headers);
    if (req.headers['x-internal-request']==="your_jwt_secret_key_change_in_production") {
      return next();
    }

    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   console.log('decoded:', decoded)
      req['user'] = decoded;
    //   console.log(req.user);
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
