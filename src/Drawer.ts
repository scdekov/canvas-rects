import { CORNER_CIRCLE_RADIUS, GRID_COLOR, BOX_COLOR } from "./constants";
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

export class Drawer {
  @usePath
  static drawBox(ctx: CanvasRenderingContext2D, box: BoundingBox) {
    ctx.strokeStyle = BOX_COLOR;
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);
  }

  @usePath
  static drawCorners(ctx: CanvasRenderingContext2D, box: BoundingBox) {
    ctx.strokeStyle = BOX_COLOR;
    ctx.moveTo(box.startX, box.startY);
    ctx.arc(box.startX, box.startY, CORNER_CIRCLE_RADIUS, 0, 2 * Math.PI);

    ctx.moveTo(box.startX + box.width, box.startY);
    ctx.arc(box.startX + box.width, box.startY, CORNER_CIRCLE_RADIUS, 0, 2 * Math.PI);

    ctx.moveTo(box.startX + box.width, box.startY + box.height);
    ctx.arc(box.startX + box.width, box.startY + box.height, CORNER_CIRCLE_RADIUS, 0, 2 * Math.PI);

    ctx.moveTo(box.startX, box.startY + box.height);
    ctx.arc(box.startX, box.startY + box.height, CORNER_CIRCLE_RADIUS, 0, 2 * Math.PI);

    ctx.stroke();
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
