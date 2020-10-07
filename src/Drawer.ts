import { GRID_COLOR, BOX_COLOR, BOX_FILL_COLOR, SELECTED_BOX_COLOR } from "./constants";
import { BoundingBox } from "./types";

const usePath = (_: Object, __: string, descriptor: TypedPropertyDescriptor<any>): any => {
  const originalMethod = descriptor.value;
  descriptor.value = (ctx: CanvasRenderingContext2D, ...args: any) => {
    ctx.beginPath();
    const result = originalMethod(ctx, ...args);
    ctx.closePath();
    return result;
  };
};

const prepareBoxForPainting = (box: BoundingBox) => {
  return {
    startX: box.startX,
    startY: box.startY,
    width: box.endX - box.startX,
    height: box.endY - box.startY
  }
}

export class Drawer {
  @usePath
  static drawBox(ctx: CanvasRenderingContext2D, box: BoundingBox, selected: boolean) {
    const preparedBox = prepareBoxForPainting(box);
    ctx.strokeStyle = selected ? SELECTED_BOX_COLOR : BOX_COLOR;
    ctx.fillStyle = BOX_FILL_COLOR;
    ctx.strokeRect(preparedBox.startX, preparedBox.startY, preparedBox.width, preparedBox.height);
    ctx.fillRect(preparedBox.startX, preparedBox.startY, preparedBox.width, preparedBox.height);
  }

  @usePath
  static drawGrid(ctx: CanvasRenderingContext2D) {
    const cellSide = 10;

    ctx.strokeStyle = GRID_COLOR;
    let y = 0;
    while (y < ctx.canvas.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      y += cellSide;
    }

    let x = 0;
    while (x < ctx.canvas.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      x += cellSide;
    }

    ctx.stroke();
  }
};
