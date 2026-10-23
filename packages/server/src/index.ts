import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import mongoose from 'mongoose';
import { connectToDatabase } from './db/connect.js';
import { authRoutes } from './routes/auth.js';
import { analysisRoutes } from './routes/analysis.js';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const developmentJwtSecret = 'zixie-local-development-secret-change-before-deploying';

export function createServer() {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('Set a JWT_SECRET of at least 32 characters before starting in production.');
  }

  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  const clientOrigin = process.env.CLIENT_ORIGIN || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000');
  app.register(cors, { origin: clientOrigin, credentials: true });
  app.register(cookie);
  app.register(jwt, {
    secret: process.env.JWT_SECRET || developmentJwtSecret,
    sign: { expiresIn: '12h' },
    cookie: { cookieName: 'zixie_token', signed: false },
  });
  app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(analysisRoutes, { prefix: '/api' });
  app.addHook('onClose', async () => { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); });

  return app;
}

// Only start listening if executed directly
if (process.argv[1] && process.argv[1].includes('index')) {
  const start = async () => {
    const app = createServer();
    try {
      await connectToDatabase();
      const address = await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
      app.log.info(`Zixie API server running on ${address}`);
    } catch (error) {
      app.log.error(error);
      await app.close();
      process.exitCode = 1;
    }
  };
  void start();
}
