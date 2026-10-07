import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ENGINE_VERSION } from '@zixie/engine';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

app.get('/api/health', async () => {
  return { status: 'healthy', engineVersion: ENGINE_VERSION, timestamp: new Date().toISOString() };
});

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Zixie API server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
