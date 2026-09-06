export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/site/styles.css');

  function isAlbEntry(track) {
    return track.artist.trim().toUpperCase().startsWith('ALB');
  }

  eleventyConfig.addFilter(
    'relativeDate',
    (dateString, referenceDateString) => {
      const date = new Date(dateString);
      const reference = new Date(referenceDateString);
      const diffMs = reference - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 1) return 'ce jour-là';
      if (diffDays === 1) return 'la veille';
      if (diffDays < 7) return `${diffDays} jours avant`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 semaine avant' : `${weeks} semaines avant`;
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 mois avant' : `${months} mois avant`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 an avant' : `${years} ans avant`;
    },
  );

  eleventyConfig.addFilter('standardDate', (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  });

  eleventyConfig.addFilter('humanDate', (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  eleventyConfig.addFilter('withTracks', (episodes) =>
    episodes.filter((e) => e.tracks.length > 0),
  );

  eleventyConfig.addFilter('realTracks', (tracks) =>
    tracks.filter((t) => !isAlbEntry(t)),
  );

  eleventyConfig.addFilter('cardSpan', (trackCount) => {
    if (trackCount <= 8) return 1;
    if (trackCount <= 16) return 2;
    return 3;
  });

  eleventyConfig.addFilter('innerColumns', (trackCount) => {
    if (trackCount <= 8) return 2;
    if (trackCount <= 16) return 4;
    return 6;
  });

  eleventyConfig.addFilter('cardSpan', (trackCount) => {
    if (trackCount <= 8) return 1;
    if (trackCount <= 16) return 2;
    return 3;
  });

  eleventyConfig.addFilter('innerColumns', (trackCount) => {
    if (trackCount <= 8) return 2;
    if (trackCount <= 16) return 4;
    return 6;
  });

  function trackKey(track) {
    return `${track.artist.trim().toLowerCase()}|||${track.title.trim().toLowerCase()}`;
  }

  // Collapses repeated identical tracks *within one episode* (e.g. the Keane joke x7)
  // into a single entry with a count.
  eleventyConfig.addFilter('dedupeTracks', (tracks) => {
    const map = new Map();
    for (const t of tracks) {
      const key = trackKey(t);
      if (map.has(key)) {
        map.get(key).count++;
      } else {
        map.set(key, { artist: t.artist, title: t.title, count: 1 });
      }
    }
    return [...map.values()];
  });
  function extractEpisodeNumber(title) {
    const match = title.match(/^#(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  eleventyConfig.addFilter('dedupeAcrossEpisodes', (episodesList) => {
    const map = new Map();
    for (const episode of episodesList) {
      const episodeNumber = extractEpisodeNumber(episode.title);
      const real = episode.tracks.filter((t) => !isAlbEntry(t));
      const seenInThisEpisode = new Set();
      for (const t of real) {
        const key = trackKey(t);
        if (seenInThisEpisode.has(key)) continue;
        seenInThisEpisode.add(key);

        if (!map.has(key)) {
          map.set(key, {
            artist: t.artist,
            title: t.title,
            episodes: [],
            latestEpisodeNumber: 0,
            latestEpisodeDate: episode.pubDate,
          });
        }
        const entry = map.get(key);
        entry.episodes.push({ title: episode.title, pubDate: episode.pubDate });
        if (episodeNumber >= entry.latestEpisodeNumber) {
          entry.latestEpisodeNumber = episodeNumber;
          entry.latestEpisodeDate = episode.pubDate;
        }
      }
    }
    return [...map.values()].sort(
      (a, b) => b.latestEpisodeNumber - a.latestEpisodeNumber,
    );
  });

  return {
    pathPrefix: '/cosy-corner-playlist/',
    dir: {
      input: 'src/site',
      output: '_site',
      includes: '_includes',
    },
  };
}
