import { Board, BoundingBox, Point } from "./types";
import { getHoveredBox, getOverlappedCorner, getSelectedBox, isInBox, isInBoxCorners, moveBox, moveBoxCorner, normalizeBoxCoords } from "./utils";

const getNewBox = (startPoint: Point): BoundingBox => ({
  id: JSON.stringify(new Date()),
  startX: startPoint.x - 10,
  startY: startPoint.y - 10,
  width: 10,
  height: 10
});

export const handleBoardClick = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = board.boxes.find(box => isInBox(cursorLocation, box));
  const selectedBox = getSelectedBox(board);

  if (selectedBox === null && clickedBox) return { ...board, selectedBoxId: clickedBox.id };
  return board;
};

export const handleBoardMouseUp = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = board.boxes.find(box => isInBox(cursorLocation, box)) || null;
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
    selectedBoxResizingCorner: null,
    selectedBoxMovingStart: null
  };
};

export const handleBoardMouseDown = (board: Board, cursorLocation: Point): Board => {
  const clickedBox = board.boxes.find(box => isInBox(cursorLocation, box)) || null;

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
  if (isInBoxCorners(cursorLocation, selectedBox)) {
    // clicked on corner => start resizing
    return {
      ...board,
      selectedBoxResizingCorner: getOverlappedCorner(cursorLocation, selectedBox)
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
    if (getHoveredBox(board, cursorLocation)) return 'pointer';
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
