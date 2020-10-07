import { Board, BoundingBox, Point } from "./types";

export const isInBox = (point: Point, box: BoundingBox, allowMargin: boolean = true): boolean => {
  const allowedMargin = allowMargin ? 10 : 0;
  const normalizedBox = normalizeBoxCoords(box);
  return (point.x >= normalizedBox.startX - allowedMargin) && (point.x <= normalizedBox.endX + allowedMargin) &&
    (point.y <= normalizedBox.endY + allowedMargin) && (point.y >= normalizedBox.startY - allowedMargin);
};

export const isInBoxCorners = (point: Point, box: BoundingBox): boolean => {
  return getOverlappedCorner(point, box) !== null;
};

export const getOverlappedCorner = (point: Point, box: BoundingBox): string | null => {
  const sideMargin = 10;
  const cornerMargin = 20;
  if ((Math.abs(point.x - box.startX) + Math.abs(point.y - box.startY)) < cornerMargin) return 'topLeft';
  if ((Math.abs(point.x - box.endX) + Math.abs(point.y - box.startY)) < cornerMargin) return 'topRight';
  if ((Math.abs(point.x - box.startX) + Math.abs(point.y - box.endY)) < cornerMargin) return 'bottomLeft';
  if ((Math.abs(point.x - box.endX) + Math.abs(point.y - box.endY)) < cornerMargin) return 'bottomRight';
  if ((Math.abs(point.x - box.startX) < sideMargin) && point.y < box.endY && point.y > box.startY)  return 'left';
  if ((Math.abs(point.x - box.endX) < sideMargin) && point.y < box.endY && point.y > box.startY)  return 'right';
  if ((Math.abs(point.y - box.startY) < sideMargin) && point.x < box.endX && point.x > box.startX)  return 'top';
  if ((Math.abs(point.y - box.endY) < sideMargin) && point.x < box.endX && point.x > box.startX)  return 'bottom';
  return null;
};

export const normalizeBoxCoords = (box: BoundingBox): BoundingBox => {
  const normalized = {...box};
  if (box.startX > box.endX) {
    normalized.startX = box.endX;
    normalized.endX = box.startX
  }
  if (box.startY > box.endY) {
    normalized.startY = box.endY;
    normalized.endY = box.startY;
  }
  return normalized;
};


export const stickPointToGrid = (point: Point): Point => {
  return {
    x: Math.round(point.x / 10) * 10,
    y: Math.round(point.y / 10) * 10
  };
};

const stickBoxToGrid = (_: Object, __: string, descriptor: TypedPropertyDescriptor<any>) => {
  const originalMethod = descriptor.value;
  descriptor.value = (...args: any): BoundingBox => {
    let box = originalMethod(...args);
    let result = {
      ...box,
      startX: Math.round(box.startX / 10) * 10,
      startY: Math.round(box.startY / 10) * 10,
      endX: Math.round(box.endX / 10) * 10,
      endY: Math.round(box.endY / 10) * 10
    };
    return result
  };
};

export class BoxMover {
  @stickBoxToGrid
  static moveCorner (box: BoundingBox, resizingCorner: string, newCorner: Point): BoundingBox {
    switch (resizingCorner) {
      case 'topLeft':
        return {
          ...box,
          startX: newCorner.x,
          startY: newCorner.y,
        };
      case 'topRight':
        return {
          ...box,
          startY: newCorner.y,
          endX: newCorner.x
        };
      case 'bottomRight':
        return {
          ...box,
          endX: newCorner.x,
          endY: newCorner.y
        };
      case 'bottomLeft':
        return {
          ...box,
          startX: newCorner.x,
          endY: newCorner.y
        };
      case 'left':
        return {
          ...box,
          startX: newCorner.x,
        };
      case 'right':
        return {
          ...box,
          endX: newCorner.x
        };
      case 'top':
        return {
          ...box,
          startY: newCorner.y,
        };
      case 'bottom':
        return {
          ...box,
          endY: newCorner.y
        };
      default:
        throw Error('invlaid corner')
    }
  }

  @stickBoxToGrid
  static moveBox (box: BoundingBox, movingStart: Point, point: Point): BoundingBox {
    return {
      ...box,
      startX: box.startX + point.x - movingStart.x,
      endX: box.endX + point.x - movingStart.x,
      startY: box.startY + point.y - movingStart.y,
      endY: box.endY + point.y - movingStart.y,
    };
  }
}

export const getSelectedBox = (board: Board): BoundingBox | null => {
  if (board.selectedBoxId === null) return null;
  return board.boxes.find(b => b.id === board.selectedBoxId);
};

export const getBoxUnderCursor = (board: Board, cursorLocation: Point): BoundingBox | null => {
  const selectedBox = getSelectedBox(board);

  // selected box is always with priority
  if (selectedBox !== null && isInBox(cursorLocation, selectedBox)) return selectedBox;

  for (let box of board.boxes) {
    if (isInBox(cursorLocation, box)) return box;
  }
  return null;
};
