export const data = {
  permalink: "/owe.json",
};

export function render({ owe }) {
  return JSON.stringify(
    {
      license: "CC BY 4.0",
      source: "https://oweyoruba.org",
      count: owe.length,
      entries: owe,
    },
    null,
    2
  );
}
