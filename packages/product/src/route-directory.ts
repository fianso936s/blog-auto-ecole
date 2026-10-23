import type { RouteSummary } from "../../core/src/index";
export const NO_CENTER = "À classer";
export const routeCenter = (route: Pick<RouteSummary, "examCenter">) =>
  route.examCenter?.trim() || NO_CENTER;
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
export function directoryCenters(routes: Pick<RouteSummary, "examCenter">[]) {
  const names = new Map<string, string>();
  for (const route of routes) {
    const label = routeCenter(route);
    const key = normalizeSearch(label);
    if (!names.has(key)) names.set(key, label);
  }
  return [...names.values()].sort((a, b) =>
    a === NO_CENTER ? 1 : b === NO_CENTER ? -1 : a.localeCompare(b, "fr"),
  );
}
export function matchesRoute(
  route: RouteSummary,
  filters: {
    search: string;
    center: string;
    difficulty: string;
    category: string;
    favorites: boolean;
  },
) {
  return (
    (filters.center === "Tous les centres" ||
      normalizeSearch(routeCenter(route)) ===
        normalizeSearch(filters.center)) &&
    (filters.difficulty === "Tous" ||
      route.difficulty === filters.difficulty) &&
    (filters.category === "Toutes" ||
      route.categories.includes(filters.category)) &&
    (!filters.favorites || route.favorite) &&
    normalizeSearch(`${route.name} ${routeCenter(route)}`).includes(
      normalizeSearch(filters.search),
    )
  );
}
