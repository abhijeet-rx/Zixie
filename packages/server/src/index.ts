import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { analysisRoutes } from './routes/analysis.js';

export function createServer() {
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

  app.register(cors, { origin: true });
  app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

  // Register main analysis endpoints under /api
  app.register(analysisRoutes, { prefix: '/api' });

  return app;
}

// Only start listening if executed directly
if (process.argv[1] && process.argv[1].includes('index')) {
  const app = createServer();
  const PORT = Number(process.env.PORT) || 4000;

  app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 Zixie API server running on ${address}`);
  });
}
