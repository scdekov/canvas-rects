export interface Sides {
  left: number,
  right: number,
  bottom: number,
  top: number
}

export interface Point {
  x: number,
  y: number
};

export interface BoundingBox {
  id: string,
  startX: number,
  startY: number,
  width: number,
  height: number
};

export interface Board {
  boxes: BoundingBox[],
  selectedBoxId: string | null,

  selectedBoxResizingCorner: string | null,
  selectedBoxMovingStart: Point | null
}
