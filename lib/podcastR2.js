const METADATA_PREFIX = 'podcasts/metadata/';

export const metadataKey = (id) => `${METADATA_PREFIX}${id}.json`;

export async function getPodcastRecord(bucket, id) {
  const object = await bucket.get(metadataKey(id));
  if (!object) return null;

  return { record: await object.json(), etag: object.etag };
}

export async function listPodcastRecords(bucket) {
  const listing = await bucket.list({ prefix: METADATA_PREFIX, limit: 1000 });
  const records = await Promise.all(
    listing.objects.map(async (object) => {
      const stored = await bucket.get(object.key);
      return stored ? stored.json() : null;
    })
  );

  return records
    .filter(Boolean)
    .sort((left, right) => right.metadata.date.localeCompare(left.metadata.date));
}

export function writePodcastRecord(bucket, record, etag) {
  return bucket.put(metadataKey(record.id), JSON.stringify(record), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
    ...(etag ? { onlyIf: { etagMatches: etag } } : {}),
  });
}

export async function deletePodcastObjects(bucket, keys) {
  const existingKeys = keys.filter(Boolean);
  if (existingKeys.length === 0) return;
  await bucket.delete(existingKeys);
}

export function removePodcastRecord(bucket, record) {
  return deletePodcastObjects(bucket, [metadataKey(record.id), record.audioKey, record.imageKey]);
}