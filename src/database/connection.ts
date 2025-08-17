import { Pool } from 'pg';
import { DatabaseConfig } from '../types';

let pool: Pool | null = null;

export const createConnectionPool = (config: DatabaseConfig): Pool => {
  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false
  });

  return pool;
};

export const getConnection = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
