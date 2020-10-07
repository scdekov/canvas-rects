import { Board, BoundingBox, Point } from "./types";
import { getHoveredBox, getOverlappedCorner, getSelectedBox, isInBox, isInBoxCorners, moveBox, moveBoxCorner, normalizeBoxCoords } from "./utils";

const getNewBox = (startPoint: Point): BoundingBox => ({
  id: JSON.stringify(new Date()),
  startX: startPoint.x,
  startY: startPoint.y,
  width: 0,
  height: 0
});

export const handleBoardClick = (board: Board, clickPoint: Point): Board => {
  const clickedBox = board.boxes.find(box => isInBox(clickPoint, box));
  const selectedBox = getSelectedBox(board);

  if (selectedBox === null) {
    // no selected box => either select what's under the cursor or create new box
    if (clickedBox) {
      return { ...board, selectedBoxId: clickedBox.id };
    } else {
      const newBox = getNewBox(clickPoint);
      return {
        ...board,
        boxes: [...board.boxes, newBox],
        selectedBoxId: newBox.id,
        selectedBoxResizingCorner: 'bottomRight'
      }
    }
  } else if (board.selectedBoxResizingCorner || board.selectedBoxMovingStart) {
    // just finished resizing or moving
    return {
      ...board,
      boxes: board.boxes.map(b => b.id === board.selectedBoxId ? normalizeBoxCoords(b) : b),
      selectedBoxResizingCorner: null,
      selectedBoxMovingStart: null
    }
  } else if (isInBoxCorners(clickPoint, selectedBox)) {
    // clicked on corner => start resizing
    return {
      ...board,
      selectedBoxResizingCorner: getOverlappedCorner(clickPoint, selectedBox)
    };
  } else if (selectedBox.id === clickedBox?.id) {
    return {
      ...board,
      selectedBoxMovingStart: clickPoint
    }
  } else {
    return {
      ...board,
      selectedBoxId: clickedBox?.id || null
    };
  }
};

const getCursorStyle = (board: Board, cursorLocation: Point): string => {
  const selectedBox = getSelectedBox(board);
  if (selectedBox === null) {
    if (getHoveredBox(board, cursorLocation)) return 'pointer';
    return 'default';
  }

  const overlappedCorner = getOverlappedCorner(cursorLocation, selectedBox);
  if (overlappedCorner) {
    return ['topLeft', 'bottomRight'].indexOf(overlappedCorner) >= 0 ? 'nwse-resize' : 'nesw-resize';
  } else if (isInBox(cursorLocation, selectedBox)) return 'move';

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
          moveBoxCorner(b, board.selectedBoxResizingCorner, movePoint) :
          b
      })
    };
  } else if (board.selectedBoxMovingStart) {
    return {
      ...board,
      selectedBoxMovingStart: movePoint,
      boxes: board.boxes.map(b => {
        return b.id === board.selectedBoxId ?
          moveBox(b, board.selectedBoxMovingStart, movePoint) :
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
