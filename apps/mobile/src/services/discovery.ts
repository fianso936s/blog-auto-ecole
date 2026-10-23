import type { MapSpot, Point } from "@repere/core";
export type Repere = Point | MapSpot;
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}
/** Local route points take precedence over their older map copy. */
export function discoverPoints(
  spots: Repere[],
  points: Repere[],
  query = "",
  category = "Tous",
) {
  const unique = new Map(spots.map((point) => [point.id, point]));
  for (const point of points) unique.set(point.id, point);
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return [...unique.values()].filter((point) => {
    const text = normalizeSearch(
      `${point.name} ${point.category} ${"note" in point ? point.note : point.question} ${"quiz" in point ? point.quiz?.question || "" : ""}`,
    );
    return (
      (category === "Tous" || point.category === category) &&
      words.every((word) => text.includes(word))
    );
  });
}
