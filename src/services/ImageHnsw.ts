import hnswlib from "hnswlib-node";
import { ImageRecord } from '../types';
import { getAllImages, addImage } from '../database/repository';

class ImageHnsw {
  private space: any = null; // HNSW index in memory
  private dim: number = 64;  // vector dimension (64 bits = 64 float32 features)
  private isInitialized: boolean = false;

  /**
   * Converts phash to vector for HNSW
   * phash in hex (16 characters) → bigint → 64-bit binary string → float32[]
   */
  private phashToVector(phash: string): number[] {
    const bigint = BigInt("0x" + phash);
    const vector = new Array(this.dim);

    for (let i = 0; i < this.dim; i++) {
      vector[i] = (bigint >> BigInt(i)) & 1n ? 1.0 : 0.0;
    }

    return vector;
  }

  async initIndex(): Promise<void> {
    if (this.space) return;

    try {
      const pictures = await getAllImages();

      this.space = new hnswlib.HierarchicalNSW("l2", this.dim);
      this.space.initIndex(pictures.length || 1, 16, 200, 100);
      // M=16, efConstruction=200, randomSeed=100

      for (const pic of pictures) {
        const vector = this.phashToVector(pic.phash_hex);
        this.space.addPoint(vector, Number(pic.id));
      }

      this.isInitialized = true;
      console.log(`HNSW index built with ${pictures.length} pictures`);
    } catch (error) {
      console.error('Failed to initialize HNSW index:', error);
      throw error;
    }
  }

  addToIndex(id: number, phash: string): void {
    if (!this.space || !this.isInitialized) {
      throw new Error("Index not initialized!");
    }

    const vector = this.phashToVector(phash);
    this.space.addPoint(vector, Number(id));
  }

  searchIndex(phash: string, k: number = 5): { neighbors: number[], distances: number[] } {
    if (!this.space || !this.isInitialized) {
      throw new Error("Index not initialized!");
    }

    const vector = this.phashToVector(phash);
    return this.space.searchKnn(vector, k);
  }

  async addImage(imageData: Omit<ImageRecord, 'id'>): Promise<ImageRecord> {
    try {
      const newImage = await addImage(imageData);

      this.addToIndex(newImage.id, newImage.phash_hex);

      return newImage;
    } catch (error) {
      console.error('Failed to add image:', error);
      throw error;
    }
  }

  async addImages(imagesData: Omit<ImageRecord, 'id'>[]): Promise<ImageRecord[]> {
    const addedImages: ImageRecord[] = [];

    for (const imageData of imagesData) {
      try {
        const newImage = await this.addImage(imageData);
        addedImages.push(newImage);
      } catch (error) {
        console.error(`Failed to add image ${imageData.file_url}:`, error);
      }
    }

    return addedImages;
  }

  getStatus(): { isInitialized: boolean; indexSize: number } {
    return {
      isInitialized: this.isInitialized,
      indexSize: this.space ? this.space.getMaxElements() : 0
    };
  }

  async rebuildIndex(): Promise<void> {
    this.space = null;
    this.isInitialized = false;
    await this.initIndex();
  }

  clear(): void {
    this.space = null;
    this.isInitialized = false;
  }
}

export const imageHnsw = new ImageHnsw();
