import Pipe from './Pipe.js';

/**
 * PipeManager class - Handles the creation and management of pipes
 */
export default class PipeManager {
    /**
     * Create a new PipeManager instance
     * @param {number} canvasWidth - Width of the game canvas
     * @param {number} canvasHeight - Height of the game canvas
     * @param {ParticleSystem} particleSystem - Game's particle system
     */
    constructor(canvasWidth, canvasHeight, particleSystem) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.pipes = [];
        this.pipeWidth = 70;
        this.pipeGap = 170;
        this.pipeColors = ['#EF476F', '#06D6A0', '#118AB2'];
        this.particleSystem = particleSystem;
    }

    /**
     * Reset the pipe manager
     */
    reset() {
        this.pipes = [];
    }

    /**
     * Add a new pipe
     */
    addPipe() {
        // Get random color
        const colorIndex = Math.floor(Math.random() * this.pipeColors.length);
        const color = this.pipeColors[colorIndex];
        
        // Create pipe
        const pipe = new Pipe(
            this.canvasWidth,
            this.canvasHeight,
            this.pipeWidth,
            this.pipeGap,
            color
        );
        
        this.pipes.push(pipe);
    }

    /**
     * Update all pipes
     * @param {number} speed - Current game speed
     * @param {Bird} bird - The bird object
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {Object} - Contains collision and score information
     */
    update(speed, bird, deltaTime) {
        let collision = false;
        let scoredPoint = false;
        
        // Update pipes and check for collisions/score
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            
            // Check collision
            if (pipe.checkCollision(bird)) {
                collision = true;
            }
            
            // Check if bird passed pipe
            if (pipe.checkPassed(bird)) {
                scoredPoint = true;
                
                // Create score particles
                if (this.particleSystem) {
                    this.particleSystem.createScoreParticles(bird.x + 20, bird.y - 20);
                }
            }
            
            // Update pipe position, remove if off screen
            const isOffScreen = pipe.update(speed, deltaTime);
            if (isOffScreen) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Add new pipe if needed
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvasWidth - 250) {
            this.addPipe();
        }
        
        return { collision, scoredPoint };
    }

    /**
     * Draw all pipes
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }

    /**
     * Update canvas dimensions
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}