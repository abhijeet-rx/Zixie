import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';
import { z } from 'zod';
import { UserModel } from '../models/user.js';

const scrypt = promisify(nodeScrypt);
const authCookie = 'zixie_token';
const tokenLifetimeSeconds = 60 * 60 * 12;
const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});
const registrationSchema = credentialsSchema.extend({ name: z.string().trim().min(1).max(80) });

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

async function verifyPassword(password: string, stored: string) {
  const [algorithm, saltText, hashText] = stored.split('$');
  if (algorithm !== 'scrypt' || !saltText || !hashText) return false;
  const salt = Buffer.from(saltText, 'base64url');
  const expected = Buffer.from(hashText, 'base64url');
  const actual = await scrypt(password, salt, expected.length) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function setSessionCookie(reply: Parameters<NonNullable<preHandlerHookHandler>>[1], token: string) {
  reply.setCookie(authCookie, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: tokenLifetimeSeconds,
  });
}

export const requireAuth: preHandlerHookHandler = async (request, reply) => {
  try {
    await request.jwtVerify({ onlyCookie: true });
  } catch {
    return reply.code(401).send({ error: 'Authentication required.' });
  }
};

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = registrationSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Enter a valid name, email, and password (at least 8 characters).' });
    const email = parsed.data.email.toLowerCase();

    try {
      const user = await UserModel.create({ name: parsed.data.name, email, passwordHash: await hashPassword(parsed.data.password) });
      const token = fastify.jwt.sign({ sub: user.id, email: user.email });
      setSessionCookie(reply, token);
      return reply.code(201).send({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) return reply.code(409).send({ error: 'An account with this email already exists.' });
      throw error;
    }
  });

  fastify.post('/login', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Enter a valid email and password.' });
    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() }).select('+passwordHash');
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Email or password is incorrect.' });
    }

    const token = fastify.jwt.sign({ sub: user.id, email: user.email });
    setSessionCookie(reply, token);
    return { user: { id: user.id, name: user.name, email: user.email } };
  });

  fastify.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    const user = await UserModel.findById(request.user.sub).select('name email');
    if (!user) return reply.code(401).send({ error: 'Account no longer exists.' });
    return { user: { id: user.id, name: user.name, email: user.email } };
  });

  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie(authCookie, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return reply.code(204).send();
  });
};
