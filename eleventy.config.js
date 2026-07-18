export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  eleventyConfig.ignores.add("scripts/**");
  eleventyConfig.ignores.add("data/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("LICENSE");
  eleventyConfig.ignores.add("CONTENT-LICENSE.md");

  // Diacritic-insensitive search field. NFD-decompose, strip combining
  // marks. Handles tone marks and the dot-below in e, o, s. Derived only,
  // never hand-authored in entry YAML.
  eleventyConfig.addFilter("toAsciiYoruba", (text) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  });

  eleventyConfig.addFilter("dateOnly", (isoString) => {
    if (!isoString) return "";
    return String(isoString).slice(0, 10);
  });

  return {
    dir: {
      input: ".",
      includes: "src/_layouts",
      data: "src/_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
