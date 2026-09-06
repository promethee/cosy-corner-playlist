import { fetchAllEpisodes } from './feed.js';

async function main() {
  const episodes = await fetchAllEpisodes();

  const withTracks = episodes.filter((e) => e.tracks.length > 0);
  console.error(
    `Fetched ${episodes.length} episodes, ${withTracks.length} with a playlist.`,
  );

  // For now: dump as JSON. Later this becomes the data source for the static page.
  console.log(JSON.stringify(episodes, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
