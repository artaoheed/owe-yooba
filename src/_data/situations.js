import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export default function () {
  const file = path.join(process.cwd(), "data", "situations.yaml");
  try {
    return yaml.load(readFileSync(file, "utf8")) || [];
  } catch {
    return [];
  }
}
