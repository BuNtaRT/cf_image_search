import express from 'express';
import { getDatabaseConfig, getServerConfig } from './config';
import { createConnectionPool, closeConnection } from './database/connection';
import { imageHnsw } from './services/ImageHnsw';
import { authenticateApiKey } from './middleware/auth';
import imagesRouter from './routes/images';

const app = express();
const config = getServerConfig();

app.use(express.json());
app.use(authenticateApiKey);

app.use('/api', imagesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Start the Express server and initialize HNSW index
 */
const startServer = async (): Promise<void> => {
  try {
    const dbConfig = getDatabaseConfig();
    createConnectionPool(dbConfig);

    await imageHnsw.initIndex();
    const status = imageHnsw.getStatus();
    console.log(`HNSW index initialized with ${status.indexSize} images`);

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`API Key required: ${config.apiKey ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Gracefully shutdown the server and close database connections
 */
const gracefulShutdown = async (): Promise<void> => {
  console.log('Shutting down gracefully...');
  await closeConnection();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
