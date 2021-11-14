import fetch from 'node-fetch';
import { createHash } from 'crypto';
import { LocalStorage } from 'node-localstorage';

const cachePath =
  process.env.PAPERCUT_PAGE_CACHE_PATH ?? './pagecache';

const pagecache = new LocalStorage(cachePath, 30 * 1024 * 1024);

const toHash = (str: string) => {
  return createHash('sha256').update(str).digest('hex');
};

export const fetchPage = async (url: string) => {
  const hashKey = toHash(url);
  const cacheResponse = pagecache.getItem(hashKey);

  if (cacheResponse) {
    return cacheResponse;
  }

  const payload = await fetch(url).then((res) => res.text());

  pagecache.setItem(hashKey, payload);

  return payload;
};
