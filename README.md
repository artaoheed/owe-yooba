# Òwe Yòòbá

A living, community-contributed archive of Yoruba proverbs (òwe), with
structured metadata and a two-axis taxonomy (theme + situation).

Live at [oweyoruba.org](https://oweyoruba.org).

## Why this exists

Yoruba proverbs are widely quoted and rarely archived with the rigor of a
proper corpus: consistent translation, sourcing, taxonomy, and a public
data dump. This project builds that archive from scratch, independently
compiled and openly licensed.

## License

- Proverb entry data and site text: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (`CONTENT-LICENSE.md`)
- Code (Eleventy config, layouts, scripts): [MIT](./LICENSE)

## Stack

Eleventy 3.x, static, no framework, deployed via GitHub Actions to GitHub
Pages. Entry data lives as one YAML file per proverb in `data/owe/`, field
names chosen to mirror a future Postgres schema so migration is a script,
not a remap.

## Local development

```bash
npm install
npm start          # local preview at http://localhost:8080
npm run validate   # validate all entries in data/owe/
npm run build      # production build to _site/
```

## Contributing an entry

Copy `data/owe/_template.yaml` to `data/owe/<slug>.yaml`, fill it in, then
run `npm run validate` before committing. See `content/editorial-policy.md`
for sourcing and translation rules, particularly around Wikiquote text and
scholarly print sources.

## Suggesting a correction

Email `hello@oweyoruba.org` with a subject line starting `[correction]`
followed by the entry slug.
