export interface Point {
  x: number,
  y: number
};

export interface BoundingBox {
  id: string,
  startX: number,
  startY: number,
  width: number,
  height: number,
  resizingCorner: string | null,
  movingStart: Point | null
};
