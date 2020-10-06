import React, { useEffect, useRef, useState } from 'react'
import './App.css';
import { BoundingBox, Point } from './types';
import { getOverlappedCorner, isInBox, isInBoxCorners, moveBoxCorner, normalizeBoxCoords, moveBox } from './utils';
import { Drawer } from './Drawer';
import { API_URL, SYNC_INTERVAL_SECONDS } from './constants';
import { getBox, saveBox } from './api';

const getNewBox = (startPoint: Point): BoundingBox => ({
  id: JSON.stringify(new Date()),
  startX: startPoint.x,
  startY: startPoint.y,
  width: 0,
  height: 0,
  resizingCorner: 'bottomRight',
  movingStart: null
});

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [allBoxes, _setAllBoxes] = useState<BoundingBox[]>([]);
  const [selectedBox, _setSelectedBox] = useState<BoundingBox | null>(null);
  const selectedBoxRef = useRef<BoundingBox | null>(null);
  const allBoxesRef = useRef<BoundingBox[]>([]);

  const setSelectedBox = (b: BoundingBox | null) => {
    selectedBoxRef.current = b;
    _setSelectedBox(b);
  };

  const setAllBoxes = (b: BoundingBox[]) => {
    allBoxesRef.current = b;
    _setAllBoxes(b);
  };

  const onClick = (point: Point, selectedBox: BoundingBox | null, allBoxes: BoundingBox[]) => {
    const clickedBox = [...allBoxes, selectedBox].find(box => box && isInBox(point, box));

    if (selectedBox === null) {
      // no selected box => either select what's under the cursor or create new box
      setSelectedBox(clickedBox || getNewBox(point));
      if (clickedBox) {
        setAllBoxes(allBoxes.filter(b => b.id !== clickedBox.id));
      }
    } else if (selectedBox.resizingCorner || selectedBox.movingStart) {
      // just finished resizing or moving
      document.body.style.cursor = 'default';
      setSelectedBox({
        ...normalizeBoxCoords(selectedBox),
        resizingCorner: null,
        movingStart: null
      });
    } else if (isInBoxCorners(point, selectedBox)) {
      // clicked on corner => start resizing
      setSelectedBox({
        ...selectedBox,
        resizingCorner: getOverlappedCorner(point, selectedBox)
      });
    } else if (selectedBox.id === clickedBox?.id) {
      document.body.style.cursor = 'move';
      setSelectedBox({
        ...selectedBox,
        movingStart: point
      })
    } else {
      setAllBoxes([...allBoxes, selectedBox]);
      setSelectedBox(clickedBox || null);
    }
  }

  const deleteSelectedBox = () => {
    setAllBoxes(allBoxesRef.current.filter(b => b.id !== selectedBoxRef.current?.id));
    setSelectedBox(null);
  };

  useEffect(() => {
    if (!canvasRef.current) {
        return;
    }

    const canvas = canvasRef.current;

    canvas.addEventListener('click', e => {
      onClick({ x: e.pageX, y: e.pageY }, selectedBoxRef.current, allBoxesRef.current);
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'Delete' && selectedBoxRef.current !== null) {
        e.preventDefault();
        deleteSelectedBox();
      }
    })

    canvas.addEventListener('mousemove', e => {
      if (selectedBoxRef.current === null) return;

      if (selectedBoxRef.current.resizingCorner) {
        setSelectedBox({
          ...moveBoxCorner(selectedBoxRef.current, { x: e.pageX, y: e.pageY })
        });
      } else if (selectedBoxRef.current.movingStart) {
        document.body.style.cursor = 'move';
        setSelectedBox({
          ...moveBox(selectedBoxRef.current, { x: e.pageX, y: e.pageY })
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath()
      if (selectedBox) {
        Drawer.drawBox(ctx, selectedBox);
        Drawer.drawCorners(ctx, selectedBox);
      }
      allBoxes.forEach(box => {
        Drawer.drawBox(ctx, box);
      });
    }
  }, [selectedBox, allBoxes]);

  return (
    <canvas
      width={window.innerWidth}
      height={window.innerHeight}
      ref={canvasRef} />
  );
}
