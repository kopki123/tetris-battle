import {
  SHAPES,
  COLORS,
  BLOCK_SIZE,
  COLS,
  ROWS,
} from './constants';
import { getRandomNumber } from './utils';

class Piece {
  ctx: CanvasRenderingContext2D;
  shape: number[][];
  color: string;
  x: number;
  y: number;

  constructor(ctx: CanvasRenderingContext2D) {
    const n = getRandomNumber(SHAPES.length);

    this.ctx = ctx;
    this.shape = SHAPES[n];
    this.color = COLORS[n];
    this.x = Math.floor(COLS / 2);
    this.y = 0;
  }

  renderTile(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  drawPiece(isPreview = false) {
    this.shape.forEach((row, i) => {
      row.forEach((tile, j) => {
        if (tile > 0) {
          const x = isPreview ? COLS + 1 + j : this.x + j;
          const y = isPreview ? 2 + i : this.y + i;
          this.renderTile(x, y, COLORS[tile - 1]);
        }
      });
    });
  }
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gameBoard: number[][];
  fallingPiece: null | Piece;
  nextPiece: Piece;
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
  moveCounter: { left: number; right: number; };
  keys: {
    left: boolean;
    right: boolean;
    down: boolean;
    up: boolean;
    space: boolean;
  };

  constructor(canvas: HTMLCanvasElement, isLocalPlayer = true) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = (COLS + 6) * BLOCK_SIZE;
    this.canvas.height = ROWS * BLOCK_SIZE;
    this.dropSpeed = 500;
    this.fastDropSpeed = 100;
    this.moveSpeed = 150;

    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.fallingPiece = null;
    this.nextPiece = new Piece(this.ctx);
    this.score = 0;
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

    if(isLocalPlayer) {
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
              // this.start();
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
    }
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
      this.nextPiece = new Piece(this.ctx);
      return;
    }

    if (this.collision(this.fallingPiece.x, this.fallingPiece.y + 1)) {
      const shape = this.fallingPiece.shape;
      const x = this.fallingPiece.x;
      const y = this.fallingPiece.y;

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
        alert('game over');
        this.isGameOver = true;
        cancelAnimationFrame(this.animationFrameId!);
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
  }

  reset() {
    this.gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.fallingPiece = null;
    this.nextPiece = new Piece(this.ctx);
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
  }

  start() {
    const animate = (timestamp: number) => {
      if (this.isPaused || this.isGameOver) {
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
      this.animationFrameId = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}




// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const game = new Game(canvas);

// let dropCounter = 0;
// let lastTime = 0;

// const MOVE_SPEED = 150;
// const moveCounter = {
//   left: 0,
//   right: 0
// };

// const keys = {
//   left: false,
//   right: false,
//   down: false,
//   up: false,
//   space: false
// };

// function gameLoop(currentTime = 0) {
//   if (game.isPaused || game.isGameOver) {
//     return;
//   }

//   const deltaTime = currentTime - lastTime;
//   lastTime = currentTime;

//   moveCounter.left += deltaTime;
//   moveCounter.right += deltaTime;

//   if (keys.left && moveCounter.left >= MOVE_SPEED) {
//     game.move('left');
//     moveCounter.left = 0;
//   }

//   if (keys.right && moveCounter.right >= MOVE_SPEED) {
//     game.move('right');
//     moveCounter.right = 0;
//   }

//   if (keys.down) game.toggleFastDrop(true);

//   dropCounter += deltaTime;
//   const dropSpeed = game.isFastDropping ? game.fastDropSpeed : game.dropSpeed;

//   if (dropCounter > dropSpeed) {
//     game.moveDown();
//     dropCounter = 0;
//   }

//   game.renderGameBoard();
//   game.animationFrameId = requestAnimationFrame(gameLoop);
// }

// gameLoop();

// document.addEventListener('keydown', (e) => {
//   if (game.isGameOver) {
//     keys.space = false;
//     keys.up = false;
//     return;
//   }

//   switch (e.key) {
//     case "w":
//     case "ArrowUp":
//       if (!keys.up) {
//         game.rotate();
//         keys.up = true;
//       }
//       break;
//     case "d":
//     case "ArrowRight":
//       keys.right = true;
//       break;
//     case "a":
//     case "ArrowLeft":
//       keys.left = true;
//       break;
//     case "s":
//     case "ArrowDown":
//       keys.down = true;
//       break;
//     case " ":
//       if (!keys.space) {
//         game.hardDrop();
//         keys.space = true;
//       }
//       break;
//     case "p":
//     case "Escape":
//       game.isPaused = !game.isPaused;
//       if (!game.isPaused) {
//         gameLoop();
//       }
//       break;
//   }
// });

// document.addEventListener('keyup', (e) => {
//   switch (e.key) {
//     case "w":
//     case "ArrowUp":
//       keys.up = false;
//       break;
//     case "d":
//     case "ArrowRight":
//       keys.right = false;
//       break;
//     case "a":
//     case "ArrowLeft":
//       keys.left = false;
//       break;
//     case "s":
//     case "ArrowDown":
//       keys.down = false;
//       game.toggleFastDrop(false);
//       break;
//     case " ":
//       keys.space = false;
//       break;
//     case "r":
//       game.reset();
//       break;
//   }
// });