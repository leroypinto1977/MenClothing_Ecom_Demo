import imagesData from "./images.json";

export interface PhotoEntry {
  url: string;
  thumb: string;
  color: string;
  alt: string;
}

type ImagePool = Record<string, PhotoEntry[]>;

const pool = imagesData as ImagePool;

export function bucket(name: string): PhotoEntry[] {
  return pool[name] ?? [];
}

/** Deterministically pick a photo from a bucket by index (wraps). */
export function photo(name: string, index: number): PhotoEntry {
  const list = bucket(name);
  return list[index % list.length];
}

export const heroImages = bucket("hero");
export const lifestyleImages = bucket("lifestyle");
