import { getConnection } from './connection';
import { ImageRecord } from '../types';

export const getAllImages = async (): Promise<ImageRecord[]> => {
  const client = getConnection();
  const result = await client.query('SELECT id, file_url, phash_hex FROM pictures ORDER BY id');
  return result.rows;
};

export const getImageByPhash = async (phashHex: string): Promise<ImageRecord[]> => {
  const client = getConnection();
  const result = await client.query(
    'SELECT id, file_url, phash_hex FROM pictures WHERE phash_hex = $1',
    [phashHex]
  );
  return result.rows;
};

export const getImagesByIds = async (ids: number[]): Promise<ImageRecord[]> => {
  if (ids.length === 0) return [];

  const client = getConnection();
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
  const result = await client.query(
    `SELECT id, file_url, phash_hex FROM pictures WHERE id IN (${placeholders}) ORDER BY id`,
    ids
  );
  return result.rows;
};

export const addImage = async (imageData: Omit<ImageRecord, 'id'>): Promise<ImageRecord> => {
  const client = getConnection();
  const result = await client.query(
    'INSERT INTO pictures (file_url, phash_hex) VALUES ($1, $2) RETURNING id, file_url, phash_hex',
    [imageData.file_url, imageData.phash_hex]
  );
  return result.rows[0];
};
