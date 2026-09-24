const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (date) => {
    const d = new Date(date);
    return `${MONTHS[d.getUTCMonth()].toUpperCase()} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addFilter("readableDateFull", (date) => {
    const d = new Date(date);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addFilter("readableDateShort", (date) => {
    const d = new Date(date);
    return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
  });

  eleventyConfig.addFilter("readableDateMonthYear", (date) => {
    const d = new Date(date);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/nav.js": "nav.js" });
  eleventyConfig.addPassthroughCopy({ "src/search.js": "search.js" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });

  eleventyConfig.addCollection("stories", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/stories/*.md").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("recentStories", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/stories/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(1, 4);
  });

  eleventyConfig.addCollection("issues", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/issues/*.md")
      .sort((a, b) => Number(b.data.number) - Number(a.data.number));
  });

  eleventyConfig.addCollection("authors", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/authors/*.md")
      .sort((a, b) => a.data.name.localeCompare(b.data.name));
  });

  eleventyConfig.addFilter("findAuthor", (slug, authors) => {
    if (!slug || !authors) return null;
    return authors.find((a) => a.fileSlug === slug) || null;
  });

  eleventyConfig.addFilter("byAuthor", (stories, slug) => {
    if (!stories || !slug) return [];
    return stories.filter((s) => s.data.author === slug);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
