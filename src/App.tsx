import React, { useEffect, useRef, useState } from 'react'
import { Board } from './types';
import { Drawer } from './Drawer';
import {
  handleBoardClick,
  handleBoardMouseDown,
  handleBoardMouseMove,
  handleBoardMouseUp,
  handleDeleteKey,
  spawnBox
} from './boardEventHandlers';
import { SAVE_STATE_INTERVAL_MS } from './constants';

const EMPTY_BOARD: Board = {
  boxes: [],
  selectedBoxId: null,
  selectedBoxMovingStart: null,
  selectedBoxResizingCorner: null
}

const BOARD_STATE_LOCAL_STORAGE_KEY = 'rects-board';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [board, _setBoard] = useState<Board>(EMPTY_BOARD);
  const boardRef = useRef<Board>(EMPTY_BOARD);

  const setBoard = (b: Board) => {
    boardRef.current = b;
    _setBoard(b);
  };

  useEffect(() => {
    const existingBoard = localStorage.getItem(BOARD_STATE_LOCAL_STORAGE_KEY);
    if (existingBoard !== null) {
      setBoard(JSON.parse(existingBoard));
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('click', e => {
      setBoard(handleBoardClick(boardRef.current, { x: e.pageX, y: e.pageY }));
    });

    window.addEventListener('mouseup', e => {
      setBoard(handleBoardMouseUp(boardRef.current, { x: e.pageX, y: e.pageY }));
    });

    window.addEventListener('mousedown', e => {
      setBoard(handleBoardMouseDown(boardRef.current, { x: e.pageX, y: e.pageY }));
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'Delete') {
        e.preventDefault();
        setBoard(handleDeleteKey(boardRef.current));
      }
    })

    window.addEventListener('mousemove', e => {
      setBoard(handleBoardMouseMove(boardRef.current, { x: e.pageX, y: e.pageY }))
    })
  }, [])

  useEffect(() => {
    setInterval(() => {
      localStorage.setItem(BOARD_STATE_LOCAL_STORAGE_KEY, JSON.stringify(boardRef.current));
    }, SAVE_STATE_INTERVAL_MS)
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
        return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      Drawer.drawGrid(ctx);
      board.boxes.forEach(box => {
        const selected = box.id === board.selectedBoxId;
        Drawer.drawBox(ctx, box, selected);
      });
    }
  }, [board]);

  return (
    <>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef} />
      <div style={{
        position: "absolute",
        top: "30px",
        left: "30px"
      }}>
        <button onClick={() => setBoard(spawnBox(board))}>Spawn Box</button>
      </div>
    </>
  );
}
