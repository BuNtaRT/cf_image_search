import { Request, Response, NextFunction } from 'express';
import { getServerConfig } from '../config';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const config = getServerConfig();
  
  if (!config.apiKey) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== config.apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
