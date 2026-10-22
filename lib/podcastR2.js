/**
 * R2 helpers for podcast media. Metadata lives in Postgres (see podcastStore.js);
 * this module only deals with the objects themselves.
 */
export async function deletePodcastObjects(bucket, keys) {
  const existingKeys = keys.filter(Boolean);
  if (existingKeys.length === 0) return;
  await bucket.delete(existingKeys);
}
