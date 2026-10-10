import { deletePodcastObjects, getPodcastRecord, removePodcastRecord, writePodcastRecord } from './podcastR2.js';
import {
  authenticate,
  createMetadata,
  fieldValue,
  isFile,
  json,
  parsePayload,
  publicRecord,
  uploadMedia,
  validateFile,
} from './podcastValidation.js';

export async function createPodcast(request, env) {
  const { form, body } = await parsePayload(request);
  const authError = await authenticate(form, body, env);
  if (authError) return authError;

  const audioFile = form?.get('audio');
  const imageFile = form?.get('image');
  const audioCheck = validateFile(audioFile, 'audio');
  if (audioCheck.error) return json({ error: audioCheck.error }, 400);
  const imageCheck = isFile(imageFile) && imageFile.size > 0 ? validateFile(imageFile, 'image') : {};
  if (imageCheck.error) return json({ error: imageCheck.error }, 400);
  const fields = { form, body };
  if (!fieldValue(form, body, 'title') || !fieldValue(form, body, 'description') || !fieldValue(form, body, 'duration')) {
    return json({ error: 'Title, description, and duration are required' }, 400);
  }

  const id = crypto.randomUUID();
  let audioKey;
  let imageKey;
  try {
    audioKey = await uploadMedia(env.PODCASTS, id, audioFile, 'audio', audioCheck.type);
    if (isFile(imageFile) && imageFile.size > 0) imageKey = await uploadMedia(env.PODCASTS, id, imageFile, 'image', imageCheck.type);
    const record = { id, metadata: createMetadata(fields, null, audioKey, imageKey, audioFile), audioKey, imageKey };
    await writePodcastRecord(env.PODCASTS, record);
    return json({ success: true, podcast: publicRecord(record) }, 201);
  } catch (error) {
    await deletePodcastObjects(env.PODCASTS, [audioKey, imageKey]);
    console.error('Podcast upload failed:', error);
    return json({ error: 'Failed to store podcast in R2' }, 500);
  }
}

export async function updatePodcast(request, env, id) {
  const stored = await getPodcastRecord(env.PODCASTS, id);
  if (!stored) return json({ error: 'Podcast not found' }, 404);
  const { form, body } = await parsePayload(request);
  const authError = await authenticate(form, body, env);
  if (authError) return authError;

  const audioFile = form?.get('audio');
  const imageFile = form?.get('image');
  const audioCheck = isFile(audioFile) && audioFile.size > 0 ? validateFile(audioFile, 'audio') : {};
  const imageCheck = isFile(imageFile) && imageFile.size > 0 ? validateFile(imageFile, 'image') : {};
  if (audioCheck.error) return json({ error: audioCheck.error }, 400);
  if (imageCheck.error) return json({ error: imageCheck.error }, 400);

  let newAudioKey;
  let newImageKey;
  try {
    if (audioCheck.type) newAudioKey = await uploadMedia(env.PODCASTS, id, audioFile, 'audio', audioCheck.type);
    if (imageCheck.type) newImageKey = await uploadMedia(env.PODCASTS, id, imageFile, 'image', imageCheck.type);
    const record = {
      ...stored.record,
      metadata: createMetadata({ form, body }, stored.record, newAudioKey || stored.record.audioKey, newImageKey || stored.record.imageKey, audioCheck.type ? audioFile : null),
      audioKey: newAudioKey || stored.record.audioKey,
      imageKey: newImageKey || stored.record.imageKey,
    };
    const saved = await writePodcastRecord(env.PODCASTS, record, stored.etag);
    if (!saved) {
      await deletePodcastObjects(env.PODCASTS, [newAudioKey, newImageKey]);
      return json({ error: 'Podcast changed concurrently; reload and retry' }, 409);
    }
    await deletePodcastObjects(env.PODCASTS, [newAudioKey && stored.record.audioKey, newImageKey && stored.record.imageKey]);
    return json({ success: true, podcast: publicRecord(record) });
  } catch (error) {
    await deletePodcastObjects(env.PODCASTS, [newAudioKey, newImageKey]);
    console.error('Podcast update failed:', error);
    return json({ error: 'Failed to update podcast in R2' }, 500);
  }
}

export async function deletePodcast(request, env, id) {
  const stored = await getPodcastRecord(env.PODCASTS, id);
  if (!stored) return json({ error: 'Podcast not found' }, 404);
  const body = await request.json();
  const authError = await authenticate(null, body, env);
  if (authError) return authError;
  await removePodcastRecord(env.PODCASTS, stored.record);
  return json({ success: true });
}