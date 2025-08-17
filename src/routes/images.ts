import { Router, Request, Response } from 'express';
import { imageHnsw } from '../services/ImageHnsw';
import { getImagesByIds } from '../database/repository';

const router = Router();

router.get('/search/:phash', async (req: Request, res: Response) => {
  try {
    const { phash } = req.params;
    const { k = 5 } = req.query;

    if (!phash || phash.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(phash)) {
      return res.status(400).json({
        error: 'Invalid phash format. Must be 64 character hex string.'
      });
    }

    const status = imageHnsw.getStatus();
    if (!status.isInitialized) {
      return res.status(503).json({ error: 'Search index not ready' });
    }

    const searchResult = imageHnsw.searchIndex(phash, Number(k));

    if (!searchResult.neighbors || searchResult.neighbors.length === 0) {
      return res.status(404).json({ error: 'No similar images found' });
    }

    const foundImages = await getImagesByIds(searchResult.neighbors);

    res.json({
      query_phash: phash,
      results: foundImages,
      distances: searchResult.distances,
      total_found: foundImages.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/add', async (req: Request, res: Response) => {
  try {
    const { file_url, phash_hex } = req.body;

    if (!file_url || !phash_hex) {
      return res.status(400).json({
        error: 'Missing required fields: file_url and phash_hex'
      });
    }

    if (phash_hex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(phash_hex)) {
      return res.status(400).json({
        error: 'Invalid phash_hex format. Must be 64 character hex string.'
      });
    }

    const newImage = await imageHnsw.addImage({ file_url, phash_hex });

    res.status(201).json({
      message: 'Image added successfully',
      image: newImage
    });

  } catch (error) {
    console.error('Add image error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

router.post('/add/batch', async (req: Request, res: Response) => {
  try {
    const images = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Request body must be a non-empty array of images'
      });
    }

    for (const image of images) {
      if (!image.file_url || !image.phash_hex) {
        return res.status(400).json({
          error: 'Each image must have file_url and phash_hex fields'
        });
      }

      if (image.phash_hex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(image.phash_hex)) {
        return res.status(400).json({
          error: `Invalid phash_hex format for image ${image.file_url}. Must be 64 character hex string.`
        });
      }
    }

    const addedImages = await imageHnsw.addImages(images);

    res.status(201).json({
      message: `Successfully added ${addedImages.length} out of ${images.length} images`,
      added_images: addedImages,
      total_requested: images.length,
      total_added: addedImages.length
    });

  } catch (error) {
    console.error('Batch add images error:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

router.get('/status', (req: Request, res: Response) => {
  try {
    const status = imageHnsw.getStatus();
    res.json({
      index_ready: status.isInitialized,
      index_size: status.indexSize,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

router.post('/rebuild', async (req: Request, res: Response) => {
  try {
    await imageHnsw.rebuildIndex();
    res.json({
      message: 'Index rebuilt successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rebuild index error:', error);
    res.status(500).json({ error: 'Failed to rebuild index' });
  }
});

export default router;
