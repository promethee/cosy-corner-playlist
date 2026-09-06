import { readFileSync } from 'node:fs';

export default function () {
  const raw = readFileSync(
    new URL('../../../data/episodes.json', import.meta.url),
    'utf8',
  );
  return JSON.parse(raw);
}
