import dotenv from 'dotenv';
import { DatabaseConfig, ServerConfig } from '../types';

dotenv.config();

export const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'image',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true'
});


export const getServerConfig = (): ServerConfig => ({
  port: parseInt(process.env.PORT || '3000'),
  apiKey: process.env.API_KEY
});
