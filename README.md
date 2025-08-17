# Image Search Service with HNSW

Image search service using HNSW (Hierarchical Navigable Small World) algorithm for fast perceptual hash search.

## Features

- **HNSW Algorithm**: Fast similar image search by phash
- **PostgreSQL**: Image metadata storage
- **TypeScript**: Full type safety
- **Express.js**: REST API server

## Installation

```bash
npm install
# or
yarn install
```

## Configuration

Copy `env.example` to `.env` and configure parameters:

```bash
cp env.example .env
```

Environment variables:
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - database name
- `DB_USER` - database user
- `DB_PASSWORD` - database password
- `API_KEY` - API key for authentication (optional)

## Usage

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Search Images

**GET** `/api/search/:phash`

Search similar images by phash using HNSW algorithm.

**Parameters:**
- `phash` - 64-character hex string perceptual hash
- `k` (query) - number of results (default: 5)

**Example:**
```bash
GET /api/search/a1b2c3d4e5f6...?k=10
```

**Response:**
```json
{
  "query_phash": "a1b2c3d4e5f6...",
  "results": [
    {
      "id": 1,
      "file_url": "https://example.com/image1.jpg",
      "phash_hex": "a1b2c3d4e5f6..."
    }
  ],
  "distances": [0.0, 0.25, 0.5],
  "total_found": 3
}
```

### Add Image

**POST** `/api/add`

Add single image to database and HNSW index.

**Request Body:**
```json
{
  "file_url": "https://example.com/image.jpg",
  "phash_hex": "a1b2c3d4e5f6..."
}
```

### Batch Add Images

**POST** `/api/add/batch`

Add array of images to database and HNSW index.

**Request Body:**
```json
[
  {
    "file_url": "https://example.com/image1.jpg",
    "phash_hex": "a1b2c3d4e5f6..."
  }
]
```

### Index Status

**GET** `/api/status`

Get HNSW index status.

### Rebuild Index

**POST** `/api/rebuild`

Rebuild HNSW index from database.

## Project Structure

```
src/
├── config/          # Configuration
├── database/        # Database connection and repository
├── middleware/      # Middleware (authentication)
├── routes/          # API routes
├── services/        # HNSW search service
├── types/           # TypeScript types
└── index.ts         # Main application file
```

## HNSW Algorithm

Service uses HNSW algorithm for fast similar image search:

- **Dimension**: 64-dimensional vectors (from phash)
- **Metric**: L2 (Euclidean distance)
- **Parameters**: M=16, efConstruction=200
- **Performance**: O(log n) for search

## Requirements

- Node.js 16+
- PostgreSQL 12+
- TypeScript 5.0+
