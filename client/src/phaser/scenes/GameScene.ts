import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  // Game properties
  private snake: Phaser.GameObjects.Graphics[] = [];
  private food: Phaser.GameObjects.Graphics | null = null;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private direction: { x: number; y: number } = { x: 0, y: -1 };
  private nextDirection: { x: number; y: number } = { x: 0, y: -1 };
  private moveTime = 0;
  private moveInterval = 200; // Snake speed - adjust for difficulty
  private gridSize = 20; // Size of each cell in pixels
  private gridWidth = 25; // Number of cells horizontally
  private gridHeight = 25; // Number of cells vertically
  private isGameOver = false;
  private score = 0;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private gameOverPanel: Phaser.GameObjects.Container | null = null;
  
  // Sounds
  private eatSound: Phaser.Sound.BaseSound | null = null;
  private hitSound: Phaser.Sound.BaseSound | null = null;
  private moveSound: Phaser.Sound.BaseSound | null = null;
  
  // Snake body parts
  private snakeHead: { x: number; y: number } = { x: 0, y: 0 };
  private snakeBody: Array<{ x: number; y: number }> = [];
  private foodPosition: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load sounds
    this.load.audio('eat', 'sounds/success.mp3');
    this.load.audio('hit', 'sounds/hit.mp3');
    this.load.audio('move', 'sounds/move.mp3');
  }

  create() {
    // Initialize sounds
    this.eatSound = this.sound.add('eat');
    this.hitSound = this.sound.add('hit');
    this.moveSound = this.sound.add('move', { volume: 0.3 });
    
    // Set up keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // Additional keyboard bindings (WASD)
      this.input.keyboard.on('keydown-W', () => {
        this.updateDirection(0, -1);
      });
      this.input.keyboard.on('keydown-S', () => {
        this.updateDirection(0, 1);
      });
      this.input.keyboard.on('keydown-A', () => {
        this.updateDirection(-1, 0);
      });
      this.input.keyboard.on('keydown-D', () => {
        this.updateDirection(1, 0);
      });
    }
    
    // Initialize snake position
    this.snakeHead = { 
      x: Math.floor(this.gridWidth / 2), 
      y: Math.floor(this.gridHeight / 2) 
    };
    this.snakeBody = [
      { x: this.snakeHead.x, y: this.snakeHead.y + 1 },
      { x: this.snakeHead.x, y: this.snakeHead.y + 2 }
    ];
    
    // Set background color (dark theme)
    this.cameras.main.setBackgroundColor('#0a1f0a');
    
    // Create forest-like background
    this.createForestBackground();
    
    // Display score
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '24px', 
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // Create initial food
    this.createFood();
    
    // Draw initial snake
    this.drawSnake();
    
    // Initialize game state
    this.isGameOver = false;
    
    // Start game prompt
    this.showStartPrompt();
  }

  update(time: number) {
    if (this.isGameOver) {
      return;
    }
    
    // Handle keyboard input
    if (this.cursors) {
      if (this.cursors.left?.isDown) {
        this.updateDirection(-1, 0);
      } else if (this.cursors.right?.isDown) {
        this.updateDirection(1, 0);
      } else if (this.cursors.up?.isDown) {
        this.updateDirection(0, -1);
      } else if (this.cursors.down?.isDown) {
        this.updateDirection(0, 1);
      }
    }
    
    // Move snake at specific intervals for controlled speed
    if (time >= this.moveTime) {
      this.moveTime = time + this.moveInterval;
      this.moveSnake();
    }
  }
  
  updateDirection(x: number, y: number) {
    // Prevent 180-degree turns (can't go in the opposite direction)
    if (
      (x !== 0 && this.direction.x !== -x) || 
      (y !== 0 && this.direction.y !== -y)
    ) {
      this.nextDirection = { x, y };
    }
  }
  
  moveSnake() {
    // Update direction from next direction 
    // (allows queuing one move ahead for better responsiveness)
    this.direction = { ...this.nextDirection };
    
    // Calculate new head position
    const newHead = {
      x: this.snakeHead.x + this.direction.x,
      y: this.snakeHead.y + this.direction.y
    };
    
    // Check for collisions
    if (this.checkCollision(newHead)) {
      this.gameOver();
      return;
    }
    
    // Check if food is eaten
    const ateFood = newHead.x === this.foodPosition.x && newHead.y === this.foodPosition.y;
    
    // Move the snake
    this.snakeBody.unshift({ ...this.snakeHead }); // Add current head to body
    this.snakeHead = newHead; // Move head
    
    if (!ateFood) {
      // Remove tail if no food eaten
      this.snakeBody.pop();
      
      // Play move sound
      if (this.moveSound) {
        this.moveSound.play();
      }
    } else {
      // Handle food eaten
      this.handleFoodEaten();
    }
    
    // Redraw snake
    this.drawSnake();
  }
  
  checkCollision(position: { x: number; y: number }): boolean {
    // Check wall collisions
    if (
      position.x < 0 || 
      position.x >= this.gridWidth ||
      position.y < 0 || 
      position.y >= this.gridHeight
    ) {
      return true;
    }
    
    // Check self-collision (with body)
    return this.snakeBody.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  }
  
  handleFoodEaten() {
    // Play sound
    if (this.eatSound) {
      this.eatSound.play();
    }
    
    // Update score
    this.score += 10;
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
    
    // Create new food
    this.createFood();
    
    // Speed up as score increases
    if (this.score % 50 === 0 && this.moveInterval > 100) {
      this.moveInterval -= 10;
    }
  }
  
  gameOver() {
    this.isGameOver = true;
    
    // Play hit sound
    if (this.hitSound) {
      this.hitSound.play();
    }
    
    // Show game over screen
    this.showGameOverScreen();
  }
  
  createFood() {
    // Find a position that's not occupied by the snake
    let validPosition = false;
    while (!validPosition) {
      this.foodPosition = {
        x: Math.floor(Math.random() * this.gridWidth),
        y: Math.floor(Math.random() * this.gridHeight)
      };
      
      // Check if position conflicts with snake
      validPosition = 
        !(this.foodPosition.x === this.snakeHead.x && 
          this.foodPosition.y === this.snakeHead.y) &&
        !this.snakeBody.some(
          segment => 
            segment.x === this.foodPosition.x && 
            segment.y === this.foodPosition.y
        );
    }
    
    // Draw food
    if (this.food) {
      this.food.destroy();
    }
    
    // Create exotic glowing fruit
    this.food = this.add.graphics();
    const foodX = this.foodPosition.x * this.gridSize + this.gridSize / 2;
    const foodY = this.foodPosition.y * this.gridSize + this.gridSize / 2;
    
    // Add subtle glow around food
    this.food.fillStyle(0x8aff8a, 0.3);
    this.food.fillCircle(foodX, foodY, this.gridSize * 0.7);
    
    // Add fruit core
    this.food.fillStyle(0x5db649, 1);
    this.food.fillCircle(foodX, foodY, this.gridSize * 0.4);
    
    // Add highlight for 3D effect
    this.food.fillStyle(0xffffff, 0.6);
    this.food.fillCircle(foodX - 2, foodY - 2, this.gridSize * 0.15);
  }
  
  drawSnake() {
    // Clear previous snake graphics
    this.snake.forEach(segment => segment.destroy());
    this.snake = [];
    
    // Draw the snake head
    const headGraphics = this.add.graphics();
    const headX = this.snakeHead.x * this.gridSize + this.gridSize / 2;
    const headY = this.snakeHead.y * this.gridSize + this.gridSize / 2;
    
    // Head gradient - darker green
    headGraphics.fillStyle(0x2a723a, 1);
    headGraphics.fillCircle(headX, headY, this.gridSize * 0.45);
    
    // Add eyes based on direction
    headGraphics.fillStyle(0x000000, 1);
    
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    const eyeOffset = this.gridSize * 0.2;
    const eyeSize = this.gridSize * 0.12;
    
    if (this.direction.x === 1) { // right
      leftEyeX = headX + eyeOffset;
      leftEyeY = headY - eyeOffset;
      rightEyeX = headX + eyeOffset;
      rightEyeY = headY + eyeOffset;
    } else if (this.direction.x === -1) { // left
      leftEyeX = headX - eyeOffset;
      leftEyeY = headY - eyeOffset;
      rightEyeX = headX - eyeOffset;
      rightEyeY = headY + eyeOffset;
    } else if (this.direction.y === -1) { // up
      leftEyeX = headX - eyeOffset;
      leftEyeY = headY - eyeOffset;
      rightEyeX = headX + eyeOffset;
      rightEyeY = headY - eyeOffset;
    } else { // down
      leftEyeX = headX - eyeOffset;
      leftEyeY = headY + eyeOffset;
      rightEyeX = headX + eyeOffset;
      rightEyeY = headY + eyeOffset;
    }
    
    // Draw elongated pupils (reptilian eyes)
    headGraphics.fillStyle(0xdede7e, 1); // Yellow eye base
    headGraphics.fillCircle(leftEyeX, leftEyeY, eyeSize);
    headGraphics.fillCircle(rightEyeX, rightEyeY, eyeSize);
    
    // Draw pupils
    headGraphics.fillStyle(0x000000, 1);
    
    // Determine which way the slit pupils should face
    const pupilWidth = eyeSize * 0.5;
    const pupilHeight = eyeSize * 1.3;
    
    // Draw slits
    if (this.direction.x !== 0) {
      // Vertical slits for horizontal movement
      headGraphics.fillEllipse(leftEyeX, leftEyeY, pupilWidth, pupilHeight);
      headGraphics.fillEllipse(rightEyeX, rightEyeY, pupilWidth, pupilHeight);
    } else {
      // Horizontal slits for vertical movement
      headGraphics.fillEllipse(leftEyeX, leftEyeY, pupilHeight, pupilWidth);
      headGraphics.fillEllipse(rightEyeX, rightEyeY, pupilHeight, pupilWidth);
    }
    
    // Add white reflection spots on eyes
    headGraphics.fillStyle(0xffffff, 0.8);
    headGraphics.fillCircle(leftEyeX - eyeSize/3, leftEyeY - eyeSize/3, eyeSize/3);
    headGraphics.fillCircle(rightEyeX - eyeSize/3, rightEyeY - eyeSize/3, eyeSize/3);
    
    this.snake.push(headGraphics);
    
    // Draw the snake body
    this.snakeBody.forEach((segment, index) => {
      const bodyGraphics = this.add.graphics();
      const x = segment.x * this.gridSize + this.gridSize / 2;
      const y = segment.y * this.gridSize + this.gridSize / 2;
      
      // Gradient color - lighter toward tail
      const greenValue = Math.min(0x3a, 0x2a + index * 0.8);
      const colorHex = Math.floor(greenValue * 0x10000 + (0x60 + index * 1.2) * 0x100 + 0x3a);
      
      // Draw body segment with tapering size
      const radius = this.gridSize * (0.45 - index * 0.005);
      bodyGraphics.fillStyle(colorHex, 1);
      bodyGraphics.fillCircle(x, y, radius);
      
      // Add scale pattern to body segments
      if (index < 8) {
        bodyGraphics.fillStyle(0x18321a, 0.4);
        
        // Draw scales
        const scaleCount = 5; 
        const scaleOffset = this.gridSize * 0.25;
        
        for (let i = 0; i < scaleCount; i++) {
          const angle = (i / scaleCount) * Math.PI * 2;
          const scaleX = x + Math.cos(angle) * scaleOffset;
          const scaleY = y + Math.sin(angle) * scaleOffset;
          
          bodyGraphics.fillCircle(scaleX, scaleY, this.gridSize * 0.08);
        }
      }
      
      this.snake.push(bodyGraphics);
    });
    
    // Draw a tongue (occasionally)
    if (Math.random() < 0.2) {
      this.drawTongue();
    }
  }
  
  drawTongue() {
    const tongueGraphics = this.add.graphics();
    const headX = this.snakeHead.x * this.gridSize + this.gridSize / 2;
    const headY = this.snakeHead.y * this.gridSize + this.gridSize / 2;
    const tongueLength = this.gridSize * 0.8;
    
    tongueGraphics.lineStyle(2, 0xe74c3c, 1);
    
    let tongueStartX = headX;
    let tongueStartY = headY;
    let tongueEndX = headX;
    let tongueEndY = headY;
    
    // Position tongue based on direction
    if (this.direction.x === 1) { // right
      tongueStartX = headX + this.gridSize * 0.4;
      tongueEndX = tongueStartX + tongueLength;
    } else if (this.direction.x === -1) { // left
      tongueStartX = headX - this.gridSize * 0.4;
      tongueEndX = tongueStartX - tongueLength;
    } else if (this.direction.y === -1) { // up
      tongueStartY = headY - this.gridSize * 0.4;
      tongueEndY = tongueStartY - tongueLength;
    } else { // down
      tongueStartY = headY + this.gridSize * 0.4;
      tongueEndY = tongueStartY + tongueLength;
    }
    
    // Draw forked tongue
    const forkSize = tongueLength * 0.3;
    
    // Main tongue
    tongueGraphics.beginPath();
    tongueGraphics.moveTo(tongueStartX, tongueStartY);
    
    // Calculate mid-point for fork
    const tongueMidX = (tongueStartX + tongueEndX) / 2;
    const tongueMidY = (tongueStartY + tongueEndY) / 2;
    
    tongueGraphics.lineTo(tongueMidX, tongueMidY);
    tongueGraphics.stroke();
    
    // Left fork
    tongueGraphics.beginPath();
    tongueGraphics.moveTo(tongueMidX, tongueMidY);
    
    let leftForkX = tongueMidX;
    let leftForkY = tongueMidY;
    
    if (this.direction.x === 1) { // right
      leftForkX = tongueEndX;
      leftForkY = tongueEndY - forkSize;
    } else if (this.direction.x === -1) { // left
      leftForkX = tongueEndX;
      leftForkY = tongueEndY - forkSize;
    } else if (this.direction.y === -1) { // up
      leftForkX = tongueEndX - forkSize;
      leftForkY = tongueEndY;
    } else { // down
      leftForkX = tongueEndX - forkSize;
      leftForkY = tongueEndY;
    }
    
    tongueGraphics.lineTo(leftForkX, leftForkY);
    tongueGraphics.stroke();
    
    // Right fork
    tongueGraphics.beginPath();
    tongueGraphics.moveTo(tongueMidX, tongueMidY);
    
    let rightForkX = tongueMidX;
    let rightForkY = tongueMidY;
    
    if (this.direction.x === 1) { // right
      rightForkX = tongueEndX;
      rightForkY = tongueEndY + forkSize;
    } else if (this.direction.x === -1) { // left
      rightForkX = tongueEndX;
      rightForkY = tongueEndY + forkSize;
    } else if (this.direction.y === -1) { // up
      rightForkX = tongueEndX + forkSize;
      rightForkY = tongueEndY;
    } else { // down
      rightForkX = tongueEndX + forkSize;
      rightForkY = tongueEndY;
    }
    
    tongueGraphics.lineTo(rightForkX, rightForkY);
    tongueGraphics.stroke();
    
    this.snake.push(tongueGraphics);
  }
  
  createForestBackground() {
    // Create dark forest floor
    const bg = this.add.graphics();
    
    // Fill background with dark gradient
    bg.fillStyle(0x0a1f0a, 1);
    bg.fillRect(0, 0, this.gridWidth * this.gridSize, this.gridHeight * this.gridSize);
    
    // Add grid lines
    bg.lineStyle(1, 0x1a331a, 0.3);
    
    // Vertical grid lines
    for (let x = 0; x <= this.gridWidth; x++) {
      bg.beginPath();
      bg.moveTo(x * this.gridSize, 0);
      bg.lineTo(x * this.gridSize, this.gridHeight * this.gridSize);
      bg.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= this.gridHeight; y++) {
      bg.beginPath();
      bg.moveTo(0, y * this.gridSize);
      bg.lineTo(this.gridWidth * this.gridSize, y * this.gridSize);
      bg.stroke();
    }
    
    // Add scattered forest details
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.gridWidth * this.gridSize;
      const y = Math.random() * this.gridHeight * this.gridSize;
      
      // Add some small grass/plant tufts
      bg.fillStyle(0x1d4a1d, 0.6);
      
      const grassHeight = 3 + Math.random() * 5;
      const grassWidth = 1 + Math.random() * 2;
      
      // Draw a few grass blades
      for (let j = 0; j < 3; j++) {
        const offsetX = (Math.random() - 0.5) * 5;
        bg.fillRect(
          x + offsetX, 
          y, 
          grassWidth, 
          -grassHeight
        );
      }
    }
    
    // Add some light spots (like moonlight through trees)
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.gridWidth * this.gridSize;
      const y = Math.random() * this.gridHeight * this.gridSize;
      const radius = 10 + Math.random() * 20;
      
      bg.fillStyle(0x8aff8a, 0.03);
      bg.fillCircle(x, y, radius);
    }
  }
  
  showStartPrompt() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    
    // Create panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(
      screenCenterX - 150, 
      screenCenterY - 100, 
      300, 
      200, 
      20
    );
    
    // Add text
    const title = this.add.text(
      screenCenterX, 
      screenCenterY - 50, 
      'SNAKE GAME', 
      { 
        fontSize: '32px', 
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    const instructionText = this.add.text(
      screenCenterX, 
      screenCenterY, 
      'Use arrow keys or WASD to move', 
      { 
        fontSize: '16px', 
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Add start button
    const startButton = this.add.text(
      screenCenterX, 
      screenCenterY + 50, 
      'START GAME', 
      { 
        fontSize: '24px', 
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#2a723a',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      // Remove start panel and start the game
      panel.destroy();
      title.destroy();
      instructionText.destroy();
      startButton.destroy();
    })
    .on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#3a8a4a' });
    })
    .on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#2a723a' });
    });
  }
  
  showGameOverScreen() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    
    // Create panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(
      screenCenterX - 150, 
      screenCenterY - 100, 
      300, 
      200, 
      20
    );
    
    // Add text
    const gameOverText = this.add.text(
      screenCenterX, 
      screenCenterY - 50, 
      'GAME OVER', 
      { 
        fontSize: '32px', 
        fontFamily: 'Arial',
        color: '#e74c3c',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    const finalScoreText = this.add.text(
      screenCenterX, 
      screenCenterY, 
      `Final Score: ${this.score}`, 
      { 
        fontSize: '24px', 
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Add restart button
    const restartButton = this.add.text(
      screenCenterX, 
      screenCenterY + 50, 
      'PLAY AGAIN', 
      { 
        fontSize: '24px', 
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#2a723a',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      // Restart the scene
      this.scene.restart();
    })
    .on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#3a8a4a' });
    })
    .on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#2a723a' });
    });
    
    // Store game over elements
    this.gameOverPanel = this.add.container(0, 0, [panel, gameOverText, finalScoreText, restartButton]);
  }
}