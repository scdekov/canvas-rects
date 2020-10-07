import { Board, BoundingBox, Point, Sides } from "./types";

const getSides = (box: BoundingBox): Sides => {
  const [left, right] = [box.startX, box.startX + box.width].sort((a, b) => a - b);
  const [top, bottom] = [box.startY, box.startY + box.height].sort((a, b) => a - b);
  return { left, right, bottom, top };
}

export const isInBox = (point: Point, box: BoundingBox): boolean => {
  const sides = getSides(box);
  const allowedMargin = 20;
  return (point.x >= sides.left - allowedMargin) && (point.x <= sides.right + allowedMargin) &&
    (point.y <= sides.bottom + allowedMargin) && (point.y >= sides.top - allowedMargin);
};

export const isInBoxCorners = (point: Point, box: BoundingBox): boolean => {
  return getOverlappedCorner(point, box) !== null;
};

export const getOverlappedCorner = (point: Point, box: BoundingBox): string | null => {
  const sides = getSides(box);
  const allowedMargin = 20;
  if ((Math.abs(point.x - sides.left) + Math.abs(point.y - sides.top)) < allowedMargin) return 'topLeft';
  if ((Math.abs(point.x - sides.right) + Math.abs(point.y - sides.top)) < allowedMargin) return 'topRight';
  if ((Math.abs(point.x - sides.left) + Math.abs(point.y - sides.bottom)) < allowedMargin) return 'bottomLeft';
  if ((Math.abs(point.x - sides.right) + Math.abs(point.y - sides.bottom)) < allowedMargin) return 'bottomRight';
  if ((Math.abs(point.x - sides.left) < allowedMargin) && point.y < sides.bottom && point.y > sides.top)  return 'left';
  if ((Math.abs(point.x - sides.right) < allowedMargin) && point.y < sides.bottom && point.y > sides.top)  return 'right';
  if ((Math.abs(point.y - sides.top) < allowedMargin) && point.x < sides.right && point.x > sides.left)  return 'top';
  if ((Math.abs(point.y - sides.bottom) < allowedMargin) && point.x < sides.right && point.x > sides.left)  return 'bottom';
  return null;
};

export const normalizeBoxCoords = (box: BoundingBox): BoundingBox => {
  const normalized = {...box};
  if (normalized.width < 0) {
    normalized.startX += normalized.width;
    normalized.width = -normalized.width;
  }
  if (normalized.height < 0) {
    normalized.startY += normalized.height;
    normalized.height = -normalized.height
  }
  return normalized;
};

const stickBoxToGrid = (_: Object, __: string, descriptor: TypedPropertyDescriptor<any>) => {
  const originalMethod = descriptor.value;
  descriptor.value = (...args: any) => {
    let box = originalMethod(...args);
    return {
      ...box,
      startX: Math.round(box.startX / 10) * 10,
      startY: Math.round(box.startY / 10) * 10,
      width: Math.round(box.width / 10) * 10,
      height: Math.round(box.height / 10) * 10
    };
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
          width: box.width + box.startX - newCorner.x,
          height: box.height + box.startY - newCorner.y
        };
      case 'topRight':
        return {
          ...box,
          startY: newCorner.y,
          width: newCorner.x - box.startX,
          height: box.height + box.startY - newCorner.y
        };
      case 'bottomRight':
        return {
          ...box,
          width: newCorner.x - box.startX,
          height: newCorner.y - box.startY,
        };
      case 'bottomLeft':
        return {
          ...box,
          startX: newCorner.x,
          width: box.width + box.startX - newCorner.x,
          height: newCorner.y - box.startY
        };
      case 'left':
        return {
          ...box,
          startX: newCorner.x,
          width: box.width + box.startX - newCorner.x
        };
      case 'right':
        return {
          ...box,
          width: newCorner.x - box.startX
        };
      case 'top':
        return {
          ...box,
          startY: newCorner.y,
          height: box.height + box.startY - newCorner.y
        };
      case 'bottom':
        return {
          ...box,
          height: newCorner.y - box.startY,
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
      startY: box.startY + point.y - movingStart.y,
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
