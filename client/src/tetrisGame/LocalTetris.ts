import { Sound, useSoundStore } from '@/stores/sound';
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
  isSingleMode: boolean;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gameBoard: number[][];
  fallingPiece: null | Piece;
  nextPiece: Piece;
  score: number;
  removedLines: number;

  isFastDropping: boolean;
  animationFrameId: null | number;
  isGameOver: boolean;
  isPaused: boolean;
  dropCounter: number;
  lastTime: number;
  moveSpeed: number;
  dropSpeed: number;
  fastDropSpeed: number;
  moveCounter: { left: number; right: number; };
  keys: {
    left: boolean;
    right: boolean;
    down: boolean;
    up: boolean;
    space: boolean;
  };
  soundStore: ReturnType<typeof useSoundStore>;

  constructor(canvas: HTMLCanvasElement, isSingleMode = true) {
    this.isSingleMode = isSingleMode;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = (COLS + 6) * BLOCK_SIZE;
    this.canvas.height = ROWS * BLOCK_SIZE;
    this.dropSpeed = 500;
    this.fastDropSpeed = 100;
    this.moveSpeed = 150;

    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.fallingPiece = null;
    const n = getRandomNumber(SHAPES.length);
    this.nextPiece = new Piece(this.ctx, SHAPES[n], COLORS[n], Math.floor(COLS / 2), 0);
    this.score = 0;
    this.removedLines = 0;
    this.isFastDropping = false;
    this.animationFrameId = null;
    this.isGameOver = false;
    this.isPaused = false;

    this.dropCounter = 0;
    this.lastTime = 0;
    this.moveCounter = {
      left: 0,
      right: 0
    };

    this.keys = {
      left: false,
      right: false,
      down: false,
      up: false,
      space: false
    };

    this.soundStore = useSoundStore();

    document.addEventListener('keydown', (e) => {
      if (this.isGameOver) {
        this.keys.space = false;
        this.keys.up = false;
        return;
      }

      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          if (!this.keys.up) {
            this.rotate();
            this.keys.up = true;
          }
          break;
        case 'd':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'a':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 's':
        case 'ArrowDown':
          this.keys.down = true;
          break;
        case ' ':
          if (!this.keys.space) {
            this.hardDrop();
            this.keys.space = true;
          }
          break;
        case 'p':
        case 'Escape':
          this.isPaused = !this.isPaused;
          if (!this.isPaused) {
            this.start();
          }
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          this.keys.up = false;
          break;
        case 'd':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'a':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 's':
        case 'ArrowDown':
          this.keys.down = false;
          this.toggleFastDrop(false);
          break;
        case ' ':
          this.keys.space = false;
          break;
        case 'r':
          this.reset();
          break;
      }
    });

    this.renderGameBoard();
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

  moveDown() {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.fallingPiece === null) {
      this.checkFilledLine();
      this.fallingPiece = this.nextPiece;

      const n = getRandomNumber(SHAPES.length);
      this.nextPiece = new Piece(this.ctx, SHAPES[n], COLORS[n], Math.floor(COLS / 2), 0);
      return;
    }

    if (this.collision(this.fallingPiece.x, this.fallingPiece.y + 1)) {
      const shape = this.fallingPiece.shape;
      const x = this.fallingPiece.x;
      const y = this.fallingPiece.y;

      this.soundStore.playSoundEffect(Sound.DROP);
      shape.forEach((row, i) => {
        row.forEach((tile, j) => {
          const p = x + j;
          const q = y + i;

          if (p >= 0 && p < COLS && q < ROWS && tile > 0) {
            this.gameBoard[q][p] = shape[i][j];
          }
        });
      });

      if (this.fallingPiece.y === 0) {
        this.soundStore.playSoundEffect(Sound.FAIL);
        this.isGameOver = true;

      }

      this.fallingPiece = null;
    } else {
      this.fallingPiece.y += 1;
    }
  }

  move(direction: string) {
    if (this.fallingPiece === null) {
      return;
    }

    const x = this.fallingPiece.x;
    const y = this.fallingPiece.y;

    if (direction === 'right' && !this.collision(x + 1, y)) {
      this.fallingPiece.x += 1;
    }

    if (direction === 'left' && !this.collision(x - 1, y)) {
      this.fallingPiece.x -= 1;
    }
  }

  rotate() {
    if (this.fallingPiece === null) {
      return;
    }

    this.soundStore.playSoundEffect(Sound.DROP);
    const shape = [...this.fallingPiece.shape.map((row) => [...row])];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < y; x++) {
        [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
      }
    }
    shape.forEach((row => row.reverse()));

    const kicks = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 2, y: 0 },
      { x: -2, y: 0 },
    ];

    for (const kick of kicks) {
      const newX = this.fallingPiece.x + kick.x;
      const newY = this.fallingPiece.y + kick.y;

      if (!this.collision(newX, newY, shape)) {
        this.fallingPiece.shape = shape;
        this.fallingPiece.x = newX;
        this.fallingPiece.y = newY;
        return;
      }
    }
  }

  hardDrop() {
    if (!this.fallingPiece) {
      return;
    }

    const ghost = this.getGhostPosition();
    if (ghost) {
      this.fallingPiece.y = ghost.y;
      this.moveDown();
    }
  }

  toggleFastDrop(enabled: boolean) {
    this.isFastDropping = enabled;
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

    if(linesCleared >= 1) {
      this.soundStore.playSoundEffect(Sound.REMOVE_LINE);
    }
  }

  reset() {
    // console.log('reset');
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
    this.moveCounter = {
      left: 0,
      right: 0
    };
    this.keys = {
      left: false,
      right: false,
      down: false,
      up: false,
      space: false
    };

    this.renderGameBoard();
    cancelAnimationFrame(this.animationFrameId!);

    this.start();
  }

  start(callback = () => {}) {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      this.renderGameBoard();
      this.ctx.fillStyle = 'white';
      this.ctx.font = '128px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(countdown.toString(), (BLOCK_SIZE * COLS) / 2, this.canvas.height / 2);
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        requestAnimationFrame(animate);
      }
    }, 1000);

    const animate = (timestamp: number) => {
      if (this.isGameOver) {
        callback();
        this.renderGameBoard();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', (BLOCK_SIZE * COLS) / 2, this.canvas.height / 2);

        if(document.getElementById('restart-btn') || !this.isSingleMode) {
          cancelAnimationFrame(this.animationFrameId!);
          return;
        }

        const restartButton = document.createElement('button');
        restartButton.id = 'restart-btn';
        restartButton.textContent = 'RESTART';
        restartButton.style.color = 'black';
        restartButton.style.background = 'white';
        restartButton.style.borderRadius = '10px';
        restartButton.style.position = 'absolute';
        restartButton.style.top = '55%';
        restartButton.style.left = '50%';
        restartButton.style.transform = 'translate(-50%, -50%)';
        restartButton.style.padding = '10px 10px';
        restartButton.style.fontSize = '24px';
        restartButton.style.cursor = 'pointer';
        document.body.appendChild(restartButton);

        restartButton.addEventListener('click', () => {
          document.body.removeChild(restartButton);
          this.reset();
        });

        cancelAnimationFrame(this.animationFrameId!);
        return;
      }

      if (this.isPaused) {
        this.renderGameBoard();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', (BLOCK_SIZE * COLS) / 2, this.canvas.height / 2);
        return;
      }

      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      this.moveCounter.left += deltaTime;
      this.moveCounter.right += deltaTime;

      if (this.keys.left && this.moveCounter.left >= this.moveSpeed) {
        this.move('left');
        this.moveCounter.left = 0;
      }

      if (this.keys.right && this.moveCounter.right >= this.moveSpeed) {
        this.move('right');
        this.moveCounter.right = 0;
      }

      if (this.keys.down) {
        this.toggleFastDrop(true);
      };

      this.dropCounter += deltaTime;
      const dropSpeed = this.isFastDropping ? this.fastDropSpeed : this.dropSpeed;

      if (this.dropCounter > dropSpeed) {
        this.moveDown();
        this.dropCounter = 0;
      }

      this.renderGameBoard();
      callback!();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    // requestAnimationFrame(animate);
  }
}