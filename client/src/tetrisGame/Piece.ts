import {
  SHAPES,
  COLORS,
  BLOCK_SIZE,
  COLS,
} from './constants';

export default class Piece {
  ctx: CanvasRenderingContext2D;
  shape: number[][];
  color: string;
  x: number;
  y: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    shape: typeof SHAPES[number],
    color: typeof COLORS[number],
    x: number,
    y: number
  ) {
    this.ctx = ctx;
    this.shape = shape;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  private renderTile(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  drawPiece(isPreview = false) {
    const offsetX = isPreview ? COLS + 1 : this.x;
    const offsetY = isPreview ? 2 : this.y;

    this.shape.forEach((row, i) => {
      row.forEach((tile, j) => {
        if (tile > 0) {
          this.renderTile(offsetX + j, offsetY + i, COLORS[tile - 1]);
        }
      });
    });
  }
}