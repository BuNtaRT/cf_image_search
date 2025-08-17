export interface ImageRecord {
  id: number;
  file_url: string;
  phash_hex: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface ServerConfig {
  port: number;
  apiKey?: string;
}
