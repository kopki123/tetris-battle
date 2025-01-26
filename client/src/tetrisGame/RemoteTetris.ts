import {
  COLORS,
  BLOCK_SIZE,
  COLS,
  ROWS,
  SHAPES,
} from './constants';
import Piece from './Piece';
import { getRandomNumber } from './utils';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gameBoard: number[][];
  fallingPiece: null | Piece;
  nextPiece: null | Piece;
  score: number;

  isFastDropping: boolean;
  animationFrameId: null | number;
  isGameOver: boolean;
  isPaused: boolean;
  dropCounter: number;
  lastTime: number;
  moveSpeed: number;
  dropSpeed: number;
  fastDropSpeed: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = (COLS + 6) * BLOCK_SIZE;
    this.canvas.height = ROWS * BLOCK_SIZE;
    this.dropSpeed = 500;
    this.fastDropSpeed = 100;
    this.moveSpeed = 150;

    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.fallingPiece = null;
    // const n = getRandomNumber(SHAPES.length);
    this.nextPiece = null;
    this.score = 0;
    this.isFastDropping = false;
    this.animationFrameId = null;
    this.isGameOver = false;
    this.isPaused = false;

    this.dropCounter = 0;
    this.lastTime = 0;
  }

  renderTile(x: number, y: number, color: string, strokeColor = 'black', lineWidth = 2) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  renderGameBoard() {
    this.gameBoard.forEach((row, i) => {
      row.forEach((tile, j) => {
        const color = tile ? COLORS[tile - 1] : 'black';
        const strokeColor = tile ? undefined : 'rgba(255, 255, 255, 0.3)';
        const lineWidth = tile ? undefined : 0.5;

        this.renderTile(j, i, color, strokeColor, lineWidth);
      });
    });

    const ghostPiece = this.getGhostPosition();
    if (ghostPiece) {
      ghostPiece.shape.forEach((row, i) => {
        row.forEach((tile, j) => {
          if (tile > 0) {
            this.renderTile(ghostPiece.x + j, ghostPiece.y + i, 'black', this.fallingPiece!.color);
          }
        });
      });
    }

    if (this.fallingPiece !== null) {
      this.fallingPiece.drawPiece();
    }

    this.ctx.fillStyle = '#1c1c1c';
    this.ctx.fillRect(COLS * BLOCK_SIZE, 0, 6 * BLOCK_SIZE, 6 * BLOCK_SIZE);

    this.ctx.strokeStyle = 'white';
    this.ctx.strokeRect(COLS * BLOCK_SIZE, 0, 6 * BLOCK_SIZE, 6 * BLOCK_SIZE);

    if (this.nextPiece) {
      this.nextPiece.drawPiece(true);
    }
  }

  collision(x: number, y: number, candidate = this.fallingPiece!.shape) {
    const shape = candidate || this.fallingPiece!.shape;
    const bounds = this.getShapeBounds(shape);

    for (let i = bounds.minY; i <= bounds.maxY; i++) {
      for (let j = bounds.minX; j <= bounds.maxX; j++) {
        if (shape[i][j] > 0) {
          const p = x + j;
          const q = y + i;

          if (p < 0 || p >= COLS || q >= ROWS) {
            return true;
          }

          if (q >= 0 && this.gameBoard[q][p] > 0) {
            return true;
          }
        }
      }
    }

    return false;
  }

  getShapeBounds(shape: number[][]) {
    let minX = shape[0].length;
    let maxX = 0;
    let minY = shape.length;
    let maxY = 0;

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] > 0) {
          minX = Math.min(minX, j);
          maxX = Math.max(maxX, j);
          minY = Math.min(minY, i);
          maxY = Math.max(maxY, i);
        }
      }
    }

    return { minX, maxX, minY, maxY };
  }

  getGhostPosition() {
    if (!this.fallingPiece) return null;

    let ghostY = this.fallingPiece.y;

    while (!this.collision(this.fallingPiece.x, ghostY + 1)) {
      ghostY++;
    }

    return {
      x: this.fallingPiece.x,
      y: ghostY,
      shape: this.fallingPiece.shape
    };
  }

  checkFilledLine() {
    let linesCleared = 0;

    this.gameBoard.forEach((row, i) => {
      if (row.every((tile) => tile > 0)) {
        this.gameBoard.splice(i, 1);
        this.gameBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
      }
    });

    switch(linesCleared) {
      case 1: this.score += 100; break;
      case 2: this.score += 300; break;
      case 3: this.score += 500; break;
      case 4: this.score += 800; break;
    }
  }

  reset() {
    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.fallingPiece = null;
    const n = getRandomNumber(SHAPES.length);
    this.nextPiece = new Piece(this.ctx, SHAPES[n], COLORS[n], Math.floor(COLS / 2), 0);
    this.score = 0;
    this.isFastDropping = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.dropCounter = 0;
    this.lastTime = 0;
  }

  start() {
    const animate = (timestamp: number) => {
      if (this.isPaused || this.isGameOver) {
        return;
      }

      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      this.dropCounter += deltaTime;

      this.renderGameBoard();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  update(gameStatus: {
    gameBoard: number[][];
    fallingPiece: Piece | null;
    nextPiece: Piece;
    score: number;
    isFastDropping: boolean;
    isGameOver: boolean;
    isPaused: boolean;
  }) {
    const {
      gameBoard,
      fallingPiece,
      nextPiece,
      score,
      isFastDropping,
      isGameOver,
      isPaused,
    } = gameStatus;

    this.gameBoard = gameBoard;
    this.fallingPiece = fallingPiece ? new Piece(this.ctx, fallingPiece!.shape, fallingPiece!.color, fallingPiece!.x, fallingPiece!.y) : null;
    this.nextPiece = new Piece(this.ctx, nextPiece?.shape, nextPiece?.color, nextPiece?.x, nextPiece?.y);
    this.score = score;
    this.isFastDropping = isFastDropping;
    this.isGameOver = isGameOver;
    this.isPaused = isPaused;
  }
}