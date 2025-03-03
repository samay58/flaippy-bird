/**
 * Bird class - Handles the player character behavior and rendering
 */
export default class Bird {
    /**
     * Create a new Bird instance
     * @param {number} canvasWidth - Width of the game canvas
     * @param {number} canvasHeight - Height of the game canvas
     * @param {ParticleSystem} particleSystem - Game's particle system
     */
    constructor(canvasWidth, canvasHeight, particleSystem) {
        this.x = canvasWidth / 3;
        this.y = canvasHeight / 2;
        this.radius = 15;
        this.velocity = 0;
        this.jumpStrength = -8;
        this.color = '#FFD166';
        this.canvasHeight = canvasHeight;
        this.particleSystem = particleSystem;
        this.rotation = 0; // Bird rotation angle
        this.targetRotation = 0; // Target rotation for smooth transitions
    }

    /**
     * Update bird physics
     * @param {number} gravity - Current gravity value
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {boolean} - Returns true if bird hits the ground (game over)
     */
    update(gravity, deltaTime = 1/60) {
        // Apply gravity
        this.velocity += gravity;
        this.y += this.velocity;
        
        // Limit falling speed
        if (this.velocity > 12) {
            this.velocity = 12;
        }
        
        // Update rotation based on velocity
        this.targetRotation = Math.max(-0.5, Math.min(Math.PI / 2, this.velocity * 0.08));
        
        // Smooth rotation interpolation
        this.rotation = this.rotation + (this.targetRotation - this.rotation) * 0.1;
        
        // Check bottom collision
        if (this.y + this.radius > this.canvasHeight) {
            this.y = this.canvasHeight - this.radius;
            
            // Create collision particles
            if (this.particleSystem) {
                this.particleSystem.createCollisionParticles(this.x, this.y, this.color);
            }
            
            return true; // Game over
        }
        
        // Check top collision
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
        
        return false;
    }

    /**
     * Make the bird jump
     */
    jump() {
        this.velocity = this.jumpStrength;
        
        // Animation effect on jump
        this.radius = 13;
        setTimeout(() => {
            this.radius = 15;
        }, 100);
        
        // Reset rotation for jump
        this.rotation = -0.3;
        
        // Create jump particles
        if (this.particleSystem) {
            this.particleSystem.createJumpParticles(
                this.x - this.radius/2, 
                this.y + this.radius/2, 
                this.color
            );
        }
    }

    /**
     * Draw the bird on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        ctx.save();
        
        // Translate to bird position and apply rotation
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Main circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        
        // Shadow effect
        ctx.beginPath();
        ctx.arc(0, 3, this.radius - 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        ctx.closePath();
        
        // Eye
        ctx.beginPath();
        ctx.arc(this.radius/2, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.closePath();
        
        // Small white reflection in eye
        ctx.beginPath();
        ctx.arc(this.radius/2 + 1, -this.radius/3 - 1, this.radius/10, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();
        
        // Beak
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, 0);
        ctx.lineTo(this.radius + 5, -2);
        ctx.lineTo(this.radius + 5, 2);
        ctx.closePath();
        ctx.fillStyle = '#ff9f1c';
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Reset the bird position and velocity
     * @param {number} canvasHeight - Height of the game canvas
     */
    reset(canvasHeight) {
        this.y = canvasHeight / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.targetRotation = 0;
        
        // Create a small "poof" effect when resetting
        if (this.particleSystem) {
            this.particleSystem.createJumpParticles(this.x, this.y, this.color);
        }
    }
}