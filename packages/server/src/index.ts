import dotenv from 'dotenv';
import { resolve } from 'node:path';
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

dotenv.config();
// Workspace scripts run with packages/server as their working directory;
// this fallback also loads the repository-root .env without overriding real env vars.
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

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

  const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('Set CLIENT_ORIGINS to the exact production frontend origin before starting in production.');
  }
  app.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? allowedOrigins
      : (allowedOrigins.length ? allowedOrigins : ['http://localhost:3000']),
    credentials: true,
  });
  app.register(cookie);
  app.register(jwt, {
    secret: process.env.JWT_SECRET || developmentJwtSecret,
    sign: { expiresIn: '12h' },
    cookie: { cookieName: 'zixie_token', signed: false },
  });
  app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  // Vercel Functions reject request bodies above 4.5 MB. Keep individual files
  // below that limit; the route also caps the combined extracted source at 4 MiB.
  app.register(multipart, { limits: { fileSize: 4 * 1024 * 1024 } });

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(analysisRoutes, { prefix: '/api' });
  app.addHook('onClose', async () => { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); });

  return app;
}

const server = createServer();
server.addHook('onReady', async () => {
  await connectToDatabase();
});
export default server;

// Start a local listener only when this module is the process entry point.
if (process.env.VERCEL !== '1' && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const start = async () => {
    try {
      const address = await server.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
      server.log.info(`Zixie API server running on ${address}`);
    } catch (error) {
      server.log.error(error);
      await server.close();
      process.exitCode = 1;
    }
  };
  void start();
}
