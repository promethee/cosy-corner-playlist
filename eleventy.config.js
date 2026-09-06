export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/site/styles.css');

  return {
    dir: {
      input: 'src/site',
      output: '_site',
      includes: '_includes',
    },
  };
}
