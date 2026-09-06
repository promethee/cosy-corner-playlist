export interface Track {
  artist: string;
  title: string;
  raw: string; // original line, kept for debugging / manual correction
}

export interface Episode {
  guid: string;
  title: string;
  pubDate: string;
  link: string;
  tracks: Track[];
}
