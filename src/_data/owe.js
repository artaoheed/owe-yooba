import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// Loads every data/owe/<slug>.yaml file, derives text_yoruba_ascii, and
// returns only published, non-restricted entries sorted by slug.
// Validation lives in scripts/validate.mjs, which CI runs before this.
export default function () {
  const dir = path.join(process.cwd(), "data", "owe");
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  } catch {
    return [];
  }

  const entries = files
    .filter((f) => !f.startsWith("_")) // skip _template.yaml
    .map((f) => {
      const raw = readFileSync(path.join(dir, f), "utf8");
      const data = yaml.load(raw);
      const text_yoruba_ascii = (data.text_yoruba || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return { ...data, text_yoruba_ascii };
    })
    .filter((e) => e.status === "published" && e.restricted !== true)
    .sort((a, b) => (a.slug > b.slug ? 1 : -1));

  return entries;
}
