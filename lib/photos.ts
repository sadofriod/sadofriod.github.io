/** Shared shape for the photography gallery (API returns this from /api/photos). */
export type Photo = {
  id: string;
  title: string;
  description?: string;
  collection: string;
  takenOn?: string;
  width: number;
  height: number;
  aspect: number;
  /** Worker preview URL: `/photos/p/<id>` (add ?w=400|800|1200|1600|2000). */
  preview: string;
  /** Worker download URL: `/photos/o/<id>`. */
  original: string;
  tags: string[];
};

export type PhotoCollection = {
  collection: string;
  count: number;
};

export const previewUrl = (photo: Photo, width: 400 | 800 | 1200 | 1600 | 2000 = 800) =>
  `${photo.preview}?w=${width}`;
