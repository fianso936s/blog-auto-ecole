export function shuffleCopy<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const draw = random();
    const bounded = Number.isFinite(draw) ? Math.min(Math.max(draw, 0), 0.9999999999999999) : 0;
    const swapIndex = Math.floor(bounded * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
