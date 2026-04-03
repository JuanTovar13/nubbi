import { Pool } from 'pg';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from './index';

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

export const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      created_by UUID NOT NULL REFERENCES auth.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
      created_by UUID NOT NULL REFERENCES auth.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};
