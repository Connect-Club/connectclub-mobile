export const bottomInset = (edges: number, bottom: number = 16): number => {
  if (edges > 0) return edges
  return bottom
}
