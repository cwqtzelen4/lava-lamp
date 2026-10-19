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

  // html: true so the CMS "Floating Image" figures render (only editors can write this text)
  // Links to other websites open in a new browser tab (automatic, nobody has to set it per link).
  const OWN_SITES = /^https?:\/\/([a-z0-9-]+\.)*(lavalampmagazine\.com|lava-lamp\.pages\.dev)(\/|$)/i;
  function externalLinksInNewTab(mdLib) {
    const original =
      mdLib.renderer.rules.link_open ||
      ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
    mdLib.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const href = tokens[idx].attrGet("href") || "";
      if (/^https?:\/\//i.test(href) && !OWN_SITES.test(href)) {
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener noreferrer");
      }
      return original(tokens, idx, options, env, self);
    };
  }

  const md = require("markdown-it")({ html: true, linkify: true });
  externalLinksInNewTab(md);
  eleventyConfig.addFilter("markdown", (text) => (text ? md.render(text) : ""));

  // story and page bodies (Eleventy's own markdown): also turn plain web addresses into links
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ linkify: true });
    externalLinksInNewTab(mdLib);
  });

  eleventyConfig.addPassthroughCopy({ "src/favicon.jpg": "favicon.jpg" });
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/nav.js": "nav.js" });
  eleventyConfig.addPassthroughCopy({ "src/search.js": "search.js" });
  eleventyConfig.addPassthroughCopy({ "src/submit.js": "submit.js" });
  eleventyConfig.addPassthroughCopy({ "src/lava.js": "lava.js" });
  eleventyConfig.addPassthroughCopy({ "src/contact.js": "contact.js" });
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

  // Contributors order, for good: the two founders are always first, in this order,
  // then everybody else A to Z by name (new authors slot in automatically).
  const FIRST_AUTHORS = ["Bilyana Spasova", "Maria Pencheva"];
  eleventyConfig.addCollection("authors", (collectionApi) => {
    const rank = (a) => {
      const i = FIRST_AUTHORS.findIndex((n) => n.toLowerCase() === String(a.data.name || "").trim().toLowerCase());
      return i === -1 ? FIRST_AUTHORS.length : i;
    };
    return collectionApi
      .getFilteredByGlob("src/authors/*.md")
      .sort((a, b) => rank(a) - rank(b) || String(a.data.name || "").localeCompare(String(b.data.name || "")));
  });

  // first few words of a longer text, then "..." (used for the short bio under articles)
  eleventyConfig.addFilter("firstWords", (text, count = 7) => {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    if (words.length <= count) return words.join(" ");
    return words.slice(0, count).join(" ").replace(/[,;:.\-–—]+$/, "") + "...";
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
