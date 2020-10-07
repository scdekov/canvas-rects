import React, { useEffect, useRef, useState } from 'react'
import { Board, BoundingBox, Point } from './types';
import { getOverlappedCorner, isInBox, isInBoxCorners, moveBoxCorner, normalizeBoxCoords, moveBox } from './utils';
import { Drawer } from './Drawer';

const getNewBox = (startPoint: Point): BoundingBox => ({
  id: JSON.stringify(new Date()),
  startX: startPoint.x,
  startY: startPoint.y,
  width: 0,
  height: 0
});

const EMPTY_BOARD: Board = {
  boxes: [],
  selectedBoxId: null,
  selectedBoxMovingStart: null,
  selectedBoxResizingCorner: null
}

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [board, _setBoard] = useState<Board>(EMPTY_BOARD);
  const boardRef = useRef<Board>(EMPTY_BOARD);

  const setBoard = (b: Board) => {
    boardRef.current = b;
    _setBoard(b);
  };

  const onClick = (point: Point, board: Board) => {
    const clickedBox = board.boxes.find(box => isInBox(point, box));
    const selectedBox = board.selectedBoxId && board.boxes.find(box => box.id === board.selectedBoxId) || null;

    if (selectedBox === null) {
      // no selected box => either select what's under the cursor or create new box
      if (clickedBox) {
        setBoard({...board, selectedBoxId: clickedBox.id});
      } else {
        const newBox = getNewBox(point);
        setBoard({
          ...board,
          boxes: [...board.boxes, newBox],
          selectedBoxId: newBox.id,
          selectedBoxResizingCorner: 'bottomRight'
        })
      }
    } else if (board.selectedBoxResizingCorner || board.selectedBoxMovingStart) {
      // just finished resizing or moving
      document.body.style.cursor = 'default';
      setBoard({
        ...board,
        boxes: board.boxes.map(b => b.id === board.selectedBoxId ? normalizeBoxCoords(b) : b),
        selectedBoxResizingCorner: null,
        selectedBoxMovingStart: null
      })
    } else if (isInBoxCorners(point, selectedBox)) {
      // clicked on corner => start resizing
      setBoard({
        ...board,
        selectedBoxResizingCorner: getOverlappedCorner(point, selectedBox)
      });
    } else if (selectedBox.id === clickedBox?.id) {
      document.body.style.cursor = 'move';
      setBoard({
        ...board,
        selectedBoxMovingStart: point
      })
    } else {
      setBoard({
        ...board,
        selectedBoxId: clickedBox?.id || null
      });
    }
  }

  const deleteSelectedBox = (board: Board) => {
    setBoard({
      ...board,
      boxes: board.boxes.filter(b => b.id !== board.selectedBoxId),
      selectedBoxId: null,
      selectedBoxMovingStart: null,
      selectedBoxResizingCorner: null
    });
  }

  useEffect(() => {
    if (!canvasRef.current) {
        return;
    }

    const canvas = canvasRef.current;

    canvas.addEventListener('click', e => {
      const board = boardRef.current;
      onClick({ x: e.pageX, y: e.pageY }, board);
    });

    window.addEventListener('keyup', e => {
      const board = boardRef.current;
      if (e.key === 'Delete' && board.selectedBoxId !== null) {
        e.preventDefault();
        deleteSelectedBox(board);
      }
    })

    canvas.addEventListener('mousemove', e => {
      const board = boardRef.current;
      const mousePoint: Point = { x: e.pageX, y: e.pageY };
      if (board.selectedBoxId === null) return;

      if (board.selectedBoxResizingCorner !== null) {
        setBoard({
          ...board,
          boxes: board.boxes.map(b => {
            return b.id === board.selectedBoxId ?
                   moveBoxCorner(b, board.selectedBoxResizingCorner, mousePoint) :
                   b
          })
        });
      } else if (board.selectedBoxMovingStart) {
        document.body.style.cursor = 'move';
        setBoard({
          ...board,
          selectedBoxMovingStart: mousePoint,
          boxes: board.boxes.map(b => {
            return b.id === board.selectedBoxId ?
                   moveBox(b, board.selectedBoxMovingStart, mousePoint) :
                   b
          })
        });
      }
    })
  }, [])

  useEffect(() => {
    if (!canvasRef.current) {
        return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const selectedBox = board.selectedBoxId && board.boxes.find(box => box.id === board.selectedBoxId) || null;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath()

      if (selectedBox !== null) {
        Drawer.drawBox(ctx, selectedBox);
        Drawer.drawCorners(ctx, selectedBox);
      }
      board.boxes.forEach(box => {
        Drawer.drawBox(ctx, box);
      });
    }
  }, [board]);

  return (
    <canvas
      width={window.innerWidth}
      height={window.innerHeight}
      ref={canvasRef} />
  );
}
