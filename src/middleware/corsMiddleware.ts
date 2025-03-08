import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin as string || "http://localhost:3000";
    const domain = new URL(origin).hostname; // Extracting the domain from the origin
    console.log('origin:', origin);
    if (domain.endsWith('') || origin.startsWith('http://localhost:3000') || origin.startsWith('http://localhost:3001')) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    // Add other CORS headers
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      // Handle preflight requests
      res.status(200).end();
    } else {
      next();
    }
  }
}
