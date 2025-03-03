import Bird from './Bird.js';
import Background from './Background.js';
import GameController from './GameController.js';
import InputHandler from './InputHandler.js';
import PipeManager from './PipeManager.js';
import ParticleSystem from './ParticleSystem.js';

/**
 * Main Game class - Orchestrates the game components
 */
export default class Game {
    /**
     * Create a new Game instance
     * @param {string} canvasId - ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Track time for animations
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Set canvas dimensions
        this.setCanvasDimensions();
        window.addEventListener('resize', () => this.handleResize());
        
        // Initialize particle system first
        this.particleSystem = new ParticleSystem();
        
        // Initialize game components with callbacks
        this.gameController = new GameController(this.canvas, {
            onStart: () => this.startGame(),
            onMenu: () => this.returnToMenu(),
            onPause: () => {},
            onResume: () => {}
        });
        
        this.bird = new Bird(this.canvas.width, this.canvas.height, this.particleSystem);
        this.background = new Background(this.canvas.width, this.canvas.height);
        this.pipeManager = new PipeManager(this.canvas.width, this.canvas.height, this.particleSystem);
        
        // Initialize input handler with additional pause callback
        this.inputHandler = new InputHandler(
            this.canvas,
            () => this.handleJump(),
            () => this.startGame(),
            () => this.togglePause()
        );
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * Set canvas dimensions based on window size
     */
    setCanvasDimensions() {
        this.canvas.width = Math.min(window.innerWidth * 0.8, 480);
        this.canvas.height = Math.min(window.innerHeight * 0.8, 640);
    }

    /**
     * Handle window resize event
     */
    handleResize() {
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        this.setCanvasDimensions();
        
        // Update game components with new dimensions
        this.background.resize(this.canvas.width, this.canvas.height);
        this.pipeManager.resize(this.canvas.width, this.canvas.height);
    }

    /**
     * Handle jump action
     */
    handleJump() {
        if (this.gameController.running) {
            this.bird.jump();
            
            // Create extra particle effects when jumping
            if (this.particleSystem) {
                // Add extra particles for visual feedback
                setTimeout(() => {
                    this.particleSystem.createJumpParticles(
                        this.bird.x - 5,
                        this.bird.y + 5,
                        this.bird.color
                    );
                }, 50);
            }
        }
    }

    /**
     * Start a new game
     */
    startGame() {
        // Clear any existing particles
        if (this.particleSystem) {
            this.particleSystem.clearParticles();
        }
        
        this.gameController.start();
        this.bird.reset(this.canvas.height);
        this.pipeManager.reset();
        this.inputHandler.setGameRunning(true);
        
        // Add a small "start" effect
        if (this.particleSystem) {
            // Random particles throughout screen
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const x = this.canvas.width * Math.random();
                    const y = this.canvas.height * Math.random();
                    this.particleSystem.createScoreParticles(x, y);
                }, i * 40);
            }
            
            // Special starting effect around the bird
            setTimeout(() => {
                this.particleSystem.createJumpParticles(
                    this.bird.x,
                    this.bird.y,
                    this.bird.color
                );
                
                // Create initial ambient particles
                for (let i = 0; i < 5; i++) {
                    this.particleSystem.createAmbientParticles(
                        this.canvas.width,
                        this.canvas.height,
                        0.1
                    );
                }
            }, 100);
        }
    }

    /**
     * End the current game
     */
    gameOver() {
        this.gameController.end();
        this.inputHandler.setGameRunning(false);
        
        // Create a large explosion of particles at the bird's position
        if (this.particleSystem) {
            // Create multiple bursts of particles for a more dramatic effect
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.particleSystem.createCollisionParticles(
                        this.bird.x, 
                        this.bird.y, 
                        this.bird.color
                    );
                }, i * 100); // Stagger the explosions
            }
            
            // Add game over score celebration with value based on score
            setTimeout(() => {
                const scoreValue = Math.min(5, Math.ceil(this.gameController.score / 5));
                if (scoreValue > 0) {
                    this.particleSystem.createScoreParticles(
                        this.canvas.width / 2,
                        this.canvas.height / 2 - 40,
                        scoreValue
                    );
                }
            }, 400);
        }
    }

    /**
     * Return to the main menu
     */
    returnToMenu() {
        // Reset game state and show title screen
        this.bird.reset(this.canvas.height);
        this.pipeManager.reset();
        this.inputHandler.setGameRunning(false);
        
        // Clear any particles
        if (this.particleSystem) {
            this.particleSystem.clearParticles();
        }
    }
    
    /**
     * Toggle game pause state
     */
    togglePause() {
        if (this.gameController.running) {
            this.gameController.togglePause();
        }
    }
    
    /**
     * The main game loop
     */
    gameLoop(currentTime) {
        // Calculate delta time for smooth animations
        if (!currentTime) currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Limit delta time to prevent big jumps after tab switching
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Always update and draw background with proper timing
        this.background.update(this.deltaTime, this.gameController.score);
        this.background.draw(this.ctx);
        
        // Check if game is running and not paused
        const isActive = this.gameController.running && !this.gameController.isPaused();
        
        if (isActive) {
            // Update game objects when active
            const birdHitGround = this.bird.update(this.gameController.gravity, this.deltaTime);
            if (birdHitGround) {
                this.gameOver();
            }
            
            // Update pipes and check collisions
            const { collision, scoredPoint } = this.pipeManager.update(
                this.gameController.speed, 
                this.bird,
                this.deltaTime
            );
            
            if (collision) {
                this.gameOver();
            }
            
            if (scoredPoint) {
                this.gameController.incrementScore();
                
                // Create score celebration particles
                if (this.particleSystem) {
                    // Normal score particle at bird location
                    this.particleSystem.createScoreParticles(
                        this.bird.x + 30,
                        this.bird.y - 20
                    );
                    
                    // Every 5 points, create a special celebration
                    if (this.gameController.score % 5 === 0) {
                        const bonusValue = Math.min(5, Math.floor(this.gameController.score / 5));
                        this.particleSystem.createScoreParticles(
                            this.canvas.width / 2,
                            this.canvas.height / 3,
                            bonusValue
                        );
                    }
                }
            }
            
            // Update particles with canvas dimensions for ambient particles
            this.particleSystem.update(this.deltaTime, this.canvas.width, this.canvas.height);
        } else if (this.gameController.running) {
            // Game is paused - still draw objects but don't update physics
            this.particleSystem.update(0, this.canvas.width, this.canvas.height); // No movement but keep alive
        } else {
            // Game is not running (title or game over)
            // Update particles for visual effects in menu/game over screens
            this.particleSystem.update(this.deltaTime, this.canvas.width, this.canvas.height);
        }
        
        // Draw game objects regardless of state
        this.pipeManager.draw(this.ctx);
        this.bird.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        
        // Update and draw UI/controller 
        this.gameController.update(this.deltaTime);
        this.gameController.draw(this.ctx);
        
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}