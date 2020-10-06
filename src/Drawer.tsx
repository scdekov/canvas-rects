import { CORNER_CIRCLE_RADIUS } from "./constants";
import { BoundingBox } from "./types";

export class Drawer {
  static drawBox(ctx: CanvasRenderingContext2D, box: BoundingBox) {
    ctx.strokeStyle = '#000000'
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);
  }

  static drawCorners(ctx: CanvasRenderingContext2D, box: BoundingBox) {
    // TODO clear old corners before drawing the new ones
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
};
