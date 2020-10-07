import { Board, BoundingBox, Point } from "./types";
import {
  getBoxUnderCursor,
  getOverlappedCorner,
  getSelectedBox,
  isInBox,
  normalizeBoxCoords,
  BoxMover, stickPointToGrid
} from "./utils";

const getNewBox = (startPoint: Point): BoundingBox => ({
  id: JSON.stringify(new Date()),
  startX: startPoint.x - 10,
  startY: startPoint.y - 10,
  endX: startPoint.x + 10,
  endY: startPoint.y + 10
});

export const handleBoardClick = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = board.boxes.find(box => isInBox(cursorLocation, box));
  const selectedBox = getSelectedBox(board);

  if (selectedBox === null && clickedBox) return { ...board, selectedBoxId: clickedBox.id };
  return board;
};

export const handleBoardMouseUp = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = getBoxUnderCursor(board, cursorLocation) || null;
  if (clickedBox === null) {
    return {
      ...board,
      selectedBoxId: null
    };
  }

  if (board.selectedBoxId === null) {
    return {
      ...board,
      selectedBoxId: clickedBox.id
    };
  }

  return {
    ...board,
    boxes: board.boxes.map(b => b.id === board.selectedBoxId ? normalizeBoxCoords(b) : b),
    selectedBoxId: clickedBox.id,
    selectedBoxResizingCorner: null,
    selectedBoxMovingStart: null
  };
};

export const handleBoardMouseDown = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = getBoxUnderCursor(board, cursorLocation);

  if (board.selectedBoxId === null) {
    if (clickedBox === null ) {
      const newBox = getNewBox(cursorLocation);
      return {
        ...board,
        boxes: [...board.boxes, newBox],
        selectedBoxId: newBox.id,
        selectedBoxResizingCorner: 'bottomRight'
      }
    } else {
      return board;
    }
  }

  if (clickedBox === null || clickedBox.id !== board.selectedBoxId) return board;

  const selectedBox = getSelectedBox(board);
  const clickedCorner = getOverlappedCorner(cursorLocation, selectedBox);
  if (clickedCorner !== null) {
    return {
      ...board,
      selectedBoxResizingCorner: clickedCorner
    };
  } else {
    return {
      ...board,
      selectedBoxMovingStart: cursorLocation
    }
  }
};

const getCursorStyle = (board: Board, cursorLocation: Point): string => {
  const selectedBox = getSelectedBox(board);
  if (selectedBox === null) {
    if (getBoxUnderCursor(board, cursorLocation)) return 'pointer';
    return 'default';
  }

  const overlappedCorner = getOverlappedCorner(cursorLocation, selectedBox);
  if (overlappedCorner) {
    if (['left', 'right'].includes(overlappedCorner)) return 'ew-resize';
    if (['top', 'bottom'].includes(overlappedCorner)) return 'ns-resize';
    if (['topLeft', 'bottomRight'].includes(overlappedCorner)) return 'nwse-resize';
    if (['bottomLeft', 'topRight'].includes(overlappedCorner)) return 'nesw-resize';
    throw Error('invalid overlapped corner');
  }

  if (isInBox(cursorLocation, selectedBox)) return 'move';

  return 'default';
};

export const handleBoardMouseMove = (board: Board, movePoint: Point): Board => {
  document.body.style.cursor = getCursorStyle(board, movePoint);

  if (board.selectedBoxId === null) return board;

  if (board.selectedBoxResizingCorner !== null) {
    return {
      ...board,
      boxes: board.boxes.map(b => {
        return b.id === board.selectedBoxId ?
          BoxMover.moveCorner(b, board.selectedBoxResizingCorner, movePoint) :
          b
      })
    };
  } else if (board.selectedBoxMovingStart) {
    return {
      ...board,
      selectedBoxMovingStart: stickPointToGrid(movePoint),
      boxes: board.boxes.map(b => {
        return b.id === board.selectedBoxId ?
          BoxMover.moveBox(b, board.selectedBoxMovingStart, movePoint) :
          b
      })
    };
  }
  return board;
};

export const handleDeleteKey = (board: Board): Board => {
  if (board.selectedBoxId === null) return board;
  return {
      ...board,
      boxes: board.boxes.filter(b => b.id !== board.selectedBoxId),
      selectedBoxId: null,
      selectedBoxMovingStart: null,
      selectedBoxResizingCorner: null
    };
};
