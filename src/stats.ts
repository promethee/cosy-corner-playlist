import { readFileSync } from "node:fs";
import type { Episode } from "./types.js";

const episodes: Episode[] = JSON.parse(readFileSync("data/episodes.json", "utf8"));

// Exclude the recurring "ALB" special-thanks entry from counts, since it's not real music
const realTrackCounts = episodes.map(
  (e) => e.tracks.filter((t) => t.artist !== "ALB").length
);

const withTracks = realTrackCounts.filter((c) => c > 0);

function percentile(sorted: number[], p: number): number {
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

const sorted = [...withTracks].sort((a, b) => a - b);
const sum = withTracks.reduce((a, b) => a + b, 0);
const mean = sum / withTracks.length;

console.log(`Total episodes: ${episodes.length}`);
console.log(`Episodes with at least one real track: ${withTracks.length}`);
console.log(`Min tracks: ${sorted[0]}`);
console.log(`Max tracks: ${sorted[sorted.length - 1]}`);
console.log(`Mean tracks: ${mean.toFixed(2)}`);
console.log(`Median tracks: ${percentile(sorted, 50)}`);
console.log(`p25: ${percentile(sorted, 25)}`);
console.log(`p75: ${percentile(sorted, 75)}`);
console.log(`p90: ${percentile(sorted, 90)}`);
console.log(`p95: ${percentile(sorted, 95)}`);

console.log("\nDistribution (track count -> number of episodes):");
const distribution = new Map<number, number>();
for (const count of withTracks) {
  distribution.set(count, (distribution.get(count) ?? 0) + 1);
}
const sortedKeys = [...distribution.keys()].sort((a, b) => a - b);
for (const key of sortedKeys) {
  const bar = "█".repeat(distribution.get(key)!);
  console.log(`${String(key).padStart(3)} tracks: ${bar} (${distribution.get(key)})`);
}