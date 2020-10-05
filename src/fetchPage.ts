import fetch from 'node-fetch';
import { LocalStorage } from 'node-localstorage';

const pagecache = new LocalStorage('./pagecache', 30 * 1024 * 1024);

export const fetchPage = async (url: string) => {
  const cacheResponse = pagecache.getItem(url);

  if (cacheResponse) {
    return cacheResponse;
  }

  const payload = await fetch(url).then(res => res.text());

  pagecache.setItem(url, payload);

  return payload;
};
