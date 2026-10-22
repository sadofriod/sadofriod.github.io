import { getPodcastRow, insertPodcast, removePodcast, updatePodcastRow } from './podcastStore.js';
import { deletePodcastObjects } from './podcastR2.js';
import {
  authenticate,
  fieldValue,
  isFile,
  json,
  parsePayload,
  uploadMedia,
  validateFile,
} from './podcastValidation.js';

const toInt = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;
};

const toKeywords = (value) =>
  value == null || value === ''
    ? undefined
    : String(value).split(',').map((word) => word.trim()).filter(Boolean);

export async function createPodcast(request, env, sql) {
  const { form, body } = await parsePayload(request);
  const authError = await authenticate(form, body, env);
  if (authError) return authError;

  const audioFile = form?.get('audio');
  const imageFile = form?.get('image');
  const audioCheck = validateFile(audioFile, 'audio');
  if (audioCheck.error) return json({ error: audioCheck.error }, 400);
  const imageCheck = isFile(imageFile) && imageFile.size > 0 ? validateFile(imageFile, 'image') : {};
  if (imageCheck.error) return json({ error: imageCheck.error }, 400);

  if (
    !fieldValue(form, body, 'title') ||
    !fieldValue(form, body, 'description') ||
    !fieldValue(form, body, 'duration')
  ) {
    return json({ error: 'Title, description, and duration are required' }, 400);
  }

  const id = crypto.randomUUID();
  let audioKey;
  let coverKey;

  try {
    audioKey = await uploadMedia(env.PODCASTS, id, audioFile, 'audio', audioCheck.type);
    if (isFile(imageFile) && imageFile.size > 0) {
      coverKey = await uploadMedia(env.PODCASTS, id, imageFile, 'image', imageCheck.type);
    }

    const record = await insertPodcast(sql, {
      id,
      title: fieldValue(form, body, 'title'),
      date: fieldValue(form, body, 'date') || new Date().toISOString().slice(0, 10),
      description: fieldValue(form, body, 'description'),
      duration: fieldValue(form, body, 'duration'),
      audioKey,
      audioSize: audioFile.size,
      audioType: audioCheck.type,
      coverKey: coverKey ?? null,
      author: fieldValue(form, body, 'author') || 'Ashes Space',
      episodeNumber: toInt(fieldValue(form, body, 'episodeNumber')) ?? null,
      season: toInt(fieldValue(form, body, 'season')) ?? null,
      keywords: toKeywords(fieldValue(form, body, 'keywords')) ?? [],
      explicit: String(fieldValue(form, body, 'explicit')) === 'true',
    });

    return json({ success: true, podcast: record }, 201);
  } catch (error) {
    await deletePodcastObjects(env.PODCASTS, [audioKey, coverKey]);
    console.error('Podcast upload failed:', error);
    return json({ error: 'Failed to store podcast' }, 500);
  }
}

export async function updatePodcast(request, env, id, sql) {
  const current = await getPodcastRow(sql, id);
  if (!current) return json({ error: 'Podcast not found' }, 404);

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
  let newCoverKey;

  try {
    if (audioCheck.type) newAudioKey = await uploadMedia(env.PODCASTS, id, audioFile, 'audio', audioCheck.type);
    if (imageCheck.type) newCoverKey = await uploadMedia(env.PODCASTS, id, imageFile, 'image', imageCheck.type);

    const value = (name) => fieldValue(form, body, name);
    const patch = {
      title: value('title') ?? current.title,
      date: value('date') ?? current.date,
      description: value('description') ?? current.description,
      duration: value('duration') ?? current.duration,
      author: value('author') ?? current.author,
      episodeNumber: value('episodeNumber') ? toInt(value('episodeNumber')) : current.episodeNumber,
      season: value('season') ? toInt(value('season')) : current.season,
      keywords: toKeywords(value('keywords')) ?? current.keywords,
      explicit:
        value('explicit') == null ? current.explicit : String(value('explicit')) === 'true',
      audioKey: newAudioKey ?? current.audioKey,
      audioSize: newAudioKey ? audioFile.size : current.audioSize,
      audioType: newAudioKey ? audioCheck.type : current.audioType,
      coverKey: newCoverKey ?? current.coverKey,
    };

    const record = await updatePodcastRow(sql, id, patch);
    if (!record) return json({ error: 'Podcast not found' }, 404);

    await deletePodcastObjects(env.PODCASTS, [
      newAudioKey && current.audioKey,
      newCoverKey && current.coverKey,
    ]);

    return json({ success: true, podcast: record });
  } catch (error) {
    await deletePodcastObjects(env.PODCASTS, [newAudioKey, newCoverKey]);
    console.error('Podcast update failed:', error);
    return json({ error: 'Failed to update podcast' }, 500);
  }
}

export async function deletePodcast(request, env, id, sql) {
  const body = await request.json();
  const authError = await authenticate(null, body, env);
  if (authError) return authError;

  const removed = await removePodcast(sql, id);
  if (!removed) return json({ error: 'Podcast not found' }, 404);

  await deletePodcastObjects(env.PODCASTS, [removed.audioKey, removed.coverKey]);
  return json({ success: true });
}
