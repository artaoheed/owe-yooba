#!/usr/bin/env node
// Validates every data/owe/<slug>.yaml file against the entry schema.
// Exits 1 with a per-file error report on any failure. CI runs this before
// the Eleventy build and refuses to deploy if it fails.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const OWE_DIR = path.join(ROOT, "data", "owe");
const THEMES_FILE = path.join(ROOT, "data", "themes.yaml");
const SITUATIONS_FILE = path.join(ROOT, "data", "situations.yaml");

const USAGE_MARKERS = ["current", "archaic", "formal", "regional"];
const STATUSES = ["draft", "published"];
const DIALECTS = ["standard", "oyo", "ijebu", "ekiti", "ondo", "other"];

const REQUIRED_NONEMPTY = [
  "text_yoruba",
  "literal_translation",
  "figurative_meaning",
  "usage_context",
  "source_attribution",
];

function loadTaxonomy(file) {
  try {
    const data = yaml.load(readFileSync(file, "utf8")) || [];
    return new Set(data.map((d) => d.slug));
  } catch (err) {
    console.error(`Fatal: could not read taxonomy file ${file}: ${err.message}`);
    process.exit(1);
  }
}

function isNfc(str) {
  return typeof str === "string" && str === str.normalize("NFC");
}

function main() {
  const themeSlugs = loadTaxonomy(THEMES_FILE);
  const situationSlugs = loadTaxonomy(SITUATIONS_FILE);

  let files;
  try {
    files = readdirSync(OWE_DIR).filter(
      (f) => (f.endsWith(".yaml") || f.endsWith(".yml")) && !f.startsWith("_")
    );
  } catch (err) {
    console.error(`Fatal: could not read ${OWE_DIR}: ${err.message}`);
    process.exit(1);
  }

  const seenSlugs = new Set();
  const errorsByFile = {};

  for (const file of files) {
    const errors = [];
    const filePath = path.join(OWE_DIR, file);
    const expectedSlug = file.replace(/\.ya?ml$/, "");

    let data;
    try {
      data = yaml.load(readFileSync(filePath, "utf8"));
    } catch (err) {
      errorsByFile[file] = [`Invalid YAML: ${err.message}`];
      continue;
    }

    if (!data || typeof data !== "object") {
      errorsByFile[file] = ["File does not contain a YAML object"];
      continue;
    }

    // Filename must equal slug
    if (data.slug !== expectedSlug) {
      errors.push(
        `slug ("${data.slug}") must equal filename ("${expectedSlug}")`
      );
    }

    // Slug format: kebab-case ascii
    if (data.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug)) {
      errors.push(`slug "${data.slug}" must be lowercase-kebab ascii`);
    }

    // Uniqueness
    if (data.slug) {
      if (seenSlugs.has(data.slug)) {
        errors.push(`slug "${data.slug}" is used by more than one file`);
      }
      seenSlugs.add(data.slug);
    }

    // Required non-empty fields
    for (const field of REQUIRED_NONEMPTY) {
      if (!data[field] || String(data[field]).trim() === "") {
        errors.push(`"${field}" is required and cannot be empty`);
      }
    }

    // NFC check on Yoruba text fields
    if (data.text_yoruba && !isNfc(data.text_yoruba)) {
      errors.push(`"text_yoruba" is not NFC-normalised (looks NFD, e.g. from macOS paste)`);
    }

    // themes / situations
    if (!Array.isArray(data.themes) || data.themes.length === 0) {
      errors.push(`"themes" must be a non-empty array`);
    } else {
      for (const t of data.themes) {
        if (!themeSlugs.has(t)) errors.push(`theme "${t}" not found in data/themes.yaml`);
      }
    }

    if (!Array.isArray(data.situations) || data.situations.length === 0) {
      errors.push(`"situations" must be a non-empty array`);
    } else {
      for (const s of data.situations) {
        if (!situationSlugs.has(s)) errors.push(`situation "${s}" not found in data/situations.yaml`);
      }
    }

    // Enums
    if (data.usage_marker && !USAGE_MARKERS.includes(data.usage_marker)) {
      errors.push(`"usage_marker" "${data.usage_marker}" must be one of: ${USAGE_MARKERS.join(", ")}`);
    }
    if (data.status && !STATUSES.includes(data.status)) {
      errors.push(`"status" "${data.status}" must be one of: ${STATUSES.join(", ")}`);
    }
    if (data.dialect && !DIALECTS.includes(data.dialect)) {
      errors.push(`"dialect" "${data.dialect}" must be one of: ${DIALECTS.join(", ")}`);
    }

    if (errors.length > 0) {
      errorsByFile[file] = errors;
    }
  }

  const failedFiles = Object.keys(errorsByFile);
  if (failedFiles.length > 0) {
    console.error(`\nValidation failed for ${failedFiles.length} file(s):\n`);
    for (const file of failedFiles) {
      console.error(`  ${file}`);
      for (const err of errorsByFile[file]) {
        console.error(`    - ${err}`);
      }
    }
    console.error("");
    process.exit(1);
  }

  console.log(`Validated ${files.length} entr${files.length === 1 ? "y" : "ies"}. All clean.`);
}

main();
