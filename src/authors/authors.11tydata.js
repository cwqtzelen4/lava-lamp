// Every author page address is worked out from the person's Role and Name,
// so nobody has to type a permalink in the CMS:
//   Author -> /authors/name/   Illustrator -> /illustrators/name/   Photographer -> /photographers/name/
const FOLDERS = {
  Author: "authors",
  Illustrator: "illustrators",
  Photographer: "photographers",
};

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  eleventyComputed: {
    authorSlug: (data) => slugify(data.name),
    permalink: (data) => `/${FOLDERS[data.role] || "authors"}/${slugify(data.name)}/`,
  },
};
