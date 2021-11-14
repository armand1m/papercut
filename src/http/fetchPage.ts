import fetch from 'node-fetch';
import { LocalStorage } from 'node-localstorage';
import { hash } from '../utilities/hash';

const cachePath =
  process.env.PAPERCUT_PAGE_CACHE_PATH ?? './pagecache';

const pagecache = new LocalStorage(cachePath, 30 * 1024 * 1024);

export const fetchPage = async (url: string) => {
  const hashKey = hash(url);
  const cacheResponse = pagecache.getItem(hashKey);

  if (cacheResponse) {
    return cacheResponse;
  }

  const payload = await fetch(url).then((res) => res.text());

  pagecache.setItem(hashKey, payload);

  return payload;
};
