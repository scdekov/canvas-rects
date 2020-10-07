export interface Point {
  x: number,
  y: number
};

export interface BoundingBox {
  id: string,
  startX: number,
  endX: number,
  startY: number,
  endY: number
};

export interface Board {
  boxes: BoundingBox[],
  selectedBoxId: string | null,

  selectedBoxResizingCorner: string | null,
  selectedBoxMovingStart: Point | null
}
