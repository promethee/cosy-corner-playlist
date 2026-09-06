export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/site/styles.css');

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
    tracks.filter((t) => t.artist !== 'ALB'),
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

  return {
    pathPrefix: '/cosy-corner-playlist/',
    dir: {
      input: 'src/site',
      output: '_site',
      includes: '_includes',
    },
  };
}
