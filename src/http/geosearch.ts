import fetch from 'node-fetch';
import { LocalStorage } from 'node-localstorage';
import { hash } from '../utilities/hash';

const geocache = new LocalStorage('./geocache');

interface Location {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon: string;
}

export interface GeosearchResult {
  latitude: number;
  longitude: number;
}

export const geosearch = async (q: string, limit: number = 1) => {
  const hashKey = hash(q);
  const cacheResponse = geocache.getItem(hashKey);

  if (cacheResponse) {
    return JSON.parse(cacheResponse) as GeosearchResult;
  }

  const params = new URLSearchParams({
    q,
    limit: Number(limit).toString(),
    format: 'json',
  });

  const ENDPOINT = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const payload: Location[] = await fetch(ENDPOINT).then((res) =>
    res.json()
  );

  if (!payload || !payload.length) {
    throw new Error(`No response for Address: ${q}`);
  }

  const result: GeosearchResult = {
    latitude: Number(payload[0].lat),
    longitude: Number(payload[0].lon),
  };

  geocache.setItem(hashKey, JSON.stringify(result));

  return result;
};
