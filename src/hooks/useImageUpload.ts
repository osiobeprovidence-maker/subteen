import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export type MediaField = 'avatar' | 'coverImage';

export function useUploadImage() {
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveImage = useMutation(api.media.saveImage);

  return async (blob: Blob, userId: Id<'users'>, field: MediaField) => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, { method: 'POST', body: blob });
    if (!result.ok) {
      throw new Error('Upload failed.');
    }
    const { storageId } = (await result.json()) as { storageId: string };
    await saveImage({ userId, field, storageId });
  };
}

export function useRemoveImage() {
  const removeImage = useMutation(api.media.removeImage);
  return (userId: Id<'users'>, field: MediaField) => removeImage({ userId, field });
}

export function useResolvedMedia(src?: string): string | undefined {
  const isStorage = !!src && !src.startsWith('http');
  const url = useQuery(api.media.getUrl, isStorage && src ? { storageId: src } : 'skip');
  return isStorage ? (url ?? undefined) : src;
}
