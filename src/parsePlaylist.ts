import type { Track } from './types.js';

/**
 * Extracts the playlist section from an episode description/summary.
 * Handles both "-- Playlist --" (bullet list) and "Playlist :" (blank-line separated) headings.
 */
export function extractPlaylist(description: string): Track[] {
  const match = description.match(
    /(?:--\s*Playlist\s*--|Playlist\s*:)\s*([\s\S]*)$/i,
  );
  if (!match) return [];

  const lines = match[1]
    .split('\n')
    .map((l) => l.replace(/^-\s*/, '').trim())
    .filter((l) => l.length > 0);

  return lines.map((raw) => parseTrackLine(raw));
}

function parseTrackLine(raw: string): Track {
  // Split on " - " (with surrounding spaces) to separate artist from title.
  // Some lines have no separator, or "???" as an unknown-artist placeholder.
  const parts = raw.split(/\s+-\s+/);

  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      raw,
    };
  }

  return { artist: 'Unknown', title: raw, raw };
}
