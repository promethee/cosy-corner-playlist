import { XMLParser } from 'fast-xml-parser';
import type { Episode } from './types.js';
import { extractPlaylist } from './parsePlaylist.js';

const FEED_URL =
  'https://feeds.soundcloud.com/users/soundcloud:users:274829367/sounds.rss';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

interface RawItem {
  guid: { '#text': string } | string;
  title: string;
  pubDate: string;
  link: string;
  description?: string;
  'itunes:summary'?: string;
}

interface RawChannel {
  'atom:link'?:
    | Array<{ '@_href': string; '@_rel': string }>
    | { '@_href': string; '@_rel': string };
  item?: RawItem[] | RawItem;
}

/**
 * Fetches all pages of the feed (following rel="next" atom:link) and returns
 * every episode with its parsed playlist.
 */
export async function fetchAllEpisodes(): Promise<Episode[]> {
  const episodes: Episode[] = [];
  let url: string | undefined = FEED_URL;
  let pageCount = 0;

  while (url) {
    pageCount++;
    console.error(`Fetching page ${pageCount}: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch feed page: ${res.status} ${res.statusText}`,
      );
    }
    const xml = await res.text();
    const data = parser.parse(xml);
    const channel: RawChannel = data.rss.channel;

    const items = toArray(channel.item);
    for (const item of items) {
      const guid =
        typeof item.guid === 'string' ? item.guid : item.guid['#text'];
      const description = item.description ?? item['itunes:summary'] ?? '';
      episodes.push({
        guid,
        title: item.title,
        pubDate: item.pubDate,
        link: item.link,
        tracks: extractPlaylist(description),
      });
    }

    url = findNextLink(channel['atom:link']);
  }

  return episodes;
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function findNextLink(
  links:
    | Array<{ '@_href': string; '@_rel': string }>
    | { '@_href': string; '@_rel': string }
    | undefined,
): string | undefined {
  const arr = toArray(links);
  return arr.find((l) => l['@_rel'] === 'next')?.['@_href'];
}
