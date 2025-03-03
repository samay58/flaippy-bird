import UI from './UI.js';

/**
 * Game Controller - Manages game state, score, and difficulty
 */
export default class GameController {
    /**
     * Create a new GameController instance
     * @param {HTMLCanvasElement} canvas - Game canvas
     * @param {Object} callbacks - Callback functions
     */
    constructor(canvas, callbacks = {}) {
        this.reset();
        this.highScore = parseInt(localStorage.getItem('highScore') || 0);
        this.paused = false;
        
        // Initialize the UI
        this.ui = new UI(canvas);
        
        // Set UI callbacks
        this.ui.setCallbacks({
            onStart: () => {
                if (callbacks.onStart) callbacks.onStart();
            },
            onMenu: () => {
                this.reset();
                if (callbacks.onMenu) callbacks.onMenu();
            },
            onPause: () => {
                this.paused = true;
                if (callbacks.onPause) callbacks.onPause();
            },
            onResume: () => {
                this.paused = false;
                if (callbacks.onResume) callbacks.onResume();
            }
        });
        
        // Show the title screen by default
        this.ui.showTitleScreen();
        this.ui.updateScore(this.score, this.highScore);
    }

    /**
     * Reset the game state
     */
    reset() {
        this.running = false;
        this.score = 0;
        this.speed = 3;
        this.gravity = 0.4;
        this.difficulty = 1;
    }

    /**
     * Start the game
     */
    start() {
        this.running = true;
        this.score = 0;
        this.difficulty = 1;
        this.speed = 3;
        this.paused = false;
        this.ui.showHUD();
        this.ui.updateScore(this.score, this.highScore);
        
        console.log("Game started - UI HUD shown");
    }

    /**
     * End the game
     */
    end() {
        this.running = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        
        // Show game over screen
        this.ui.showGameOverScreen(this.score, this.highScore);
    }

    /**
     * Increment the score
     */
    incrementScore() {
        this.score++;
        this.updateDifficulty();
        this.ui.updateScore(this.score, this.highScore);
    }

    /**
     * Update the game difficulty based on score
     */
    updateDifficulty() {
        if (this.score % 5 === 0) {
            this.difficulty += 0.1;
            this.speed = 3 + this.difficulty;
        }
    }
    
    /**
     * Update method for game controller
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update UI animations
        this.ui.update(deltaTime);
    }
    
    /**
     * Draw method for game controller
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        // Draw UI
        this.ui.draw(ctx);
    }
    
    /**
     * Check if the game is paused
     * @returns {boolean} Whether the game is paused
     */
    isPaused() {
        return this.paused;
    }
    
    /**
     * Show the title screen
     */
    showTitleScreen() {
        this.ui.showTitleScreen();
        this.ui.updateScore(this.score, this.highScore);
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            this.ui.showScreen('pauseScreen');
        } else {
            this.ui.showHUD();
        }
    }
}