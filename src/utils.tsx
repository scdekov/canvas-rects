import { allowedNodeEnvironmentFlags } from "process";
import { BoundingBox, Point } from "./types";

interface Sides {
  left: number,
  right: number,
  bottom: number,
  top: number
}

const getSides = (box: BoundingBox): Sides => {
  const [left, right] = [box.startX, box.startX + box.width].sort((a, b) => a - b);
  const [top, bottom] = [box.startY, box.startY + box.height].sort((a, b) => a - b);
  return { left, right, bottom, top };
}

export const isInBox = (point: Point, box: BoundingBox): boolean => {
  const sides = getSides(box);
  return (point.x > sides.left) && (point.x < sides.right) &&
    (point.y < sides.bottom) && (point.y > sides.top);
};

export const isInBoxCorners = (point: Point, box: BoundingBox): boolean => {
  return getOverlappedCorner(point, box) !== null;
};

export const getOverlappedCorner = (point: Point, box: BoundingBox): string | null => {
  const sides = getSides(box);
  const allowedMargin = 20;
  if ((Math.abs(point.x - sides.left) + Math.abs(point.y - sides.top)) < allowedMargin) { return 'topLeft' };
  if ((Math.abs(point.x - sides.right) + Math.abs(point.y - sides.top)) < allowedMargin) { return 'topRight' };
  if ((Math.abs(point.x - sides.left) + Math.abs(point.y - sides.bottom)) < allowedMargin) { return 'bottomLeft' };
  if ((Math.abs(point.x - sides.right) + Math.abs(point.y - sides.bottom)) < allowedMargin) { return 'bottomRight'};
  return null;
};

export const normalizeBoxCoords = (box: BoundingBox): BoundingBox => {
  const normalized = {...box};
  if (normalized.width < 0) {
    normalized.startX += normalized.width;
    normalized.width = -normalized.width
  }
  if (normalized.height < 0) {
    normalized.startY += normalized.height;
    normalized.height = -normalized.height
  }
  return normalized;
};

export const moveBoxCorner = (box: BoundingBox, newCorner: Point): BoundingBox => {
  switch (box.resizingCorner) {
    case 'topLeft':
      return {
        ...box,
        startX: newCorner.x,
        startY: newCorner.y,
        width: box.width + box.startX - newCorner.x,
        height: box.height + box.startY - newCorner.y
      }
    case 'topRight':
      return {
        ...box,
        startY: newCorner.y,
        width: newCorner.x - box.startX,
        height: box.height + box.startY - newCorner.y
      }
    case 'bottomRight':
      return {
        ...box,
        width: newCorner.x - box.startX,
        height: newCorner.y - box.startY,
      }
    case 'bottomLeft':
      return {
        ...box,
        startX: newCorner.x,
        width: box.width + box.startX - newCorner.x,
        height: newCorner.y - box.startY
      }
    default :
      throw 'invlaid corner'
  }
};

export const moveBox = (box: BoundingBox, point: Point) => {
  if (box.movingStart === null) return box;
  return {
    ...box,
    startX: box.startX + point.x - box.movingStart.x,
    startY: box.startY + point.y - box.movingStart.y,
    movingStart: point,
  };
};
