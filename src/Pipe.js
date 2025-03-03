/**
 * Pipe class - Represents a pipe obstacle in the game
 */
export default class Pipe {
    /**
     * Create a new pipe
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {number} pipeWidth - Width of the pipe
     * @param {number} pipeGap - Gap between top and bottom pipes
     * @param {string} color - Pipe color
     */
    constructor(canvasWidth, canvasHeight, pipeWidth, pipeGap, color) {
        const gapPosition = Math.random() * (canvasHeight - pipeGap - 120) + 60;
        
        this.x = canvasWidth;
        this.gapTop = gapPosition;
        this.gapBottom = gapPosition + pipeGap;
        this.width = pipeWidth;
        this.color = color;
        this.passed = false;
        this.canvasHeight = canvasHeight;
    }

    /**
     * Update pipe position
     * @param {number} speed - Current game speed
     * @param {number} deltaTime - Time since last update
     * @returns {boolean} - Whether the pipe is off screen
     */
    update(speed, deltaTime) {
        this.x -= speed;
        
        // Return true if pipe is off screen
        return this.x + this.width < 0;
    }

    /**
     * Draw pipe on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        // Top pipe
        const cornerRadius = 6;
        
        // Draw top pipe with rounded bottom corners
        this.drawRoundedRect(
            ctx, 
            this.x, 
            0, 
            this.width, 
            this.gapTop, 
            { bottomLeft: cornerRadius, bottomRight: cornerRadius }
        );
        
        // Draw bottom pipe with rounded top corners
        this.drawRoundedRect(
            ctx, 
            this.x, 
            this.gapBottom, 
            this.width, 
            this.canvasHeight - this.gapBottom, 
            { topLeft: cornerRadius, topRight: cornerRadius }
        );
        
        // Add gradient for 3D effect
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        
        // Apply gradient to top pipe
        this.drawRoundedRect(
            ctx, 
            this.x, 
            0, 
            this.width, 
            this.gapTop, 
            { bottomLeft: cornerRadius, bottomRight: cornerRadius }
        );
        
        // Apply gradient to bottom pipe
        this.drawRoundedRect(
            ctx, 
            this.x, 
            this.gapBottom, 
            this.width, 
            this.canvasHeight - this.gapBottom, 
            { topLeft: cornerRadius, topRight: cornerRadius }
        );
        
        // Add decorative bands
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(this.x, this.gapTop - 15, this.width, 8);
        ctx.fillRect(this.x, this.gapBottom + 7, this.width, 8);
        
        // Add shadow effects at pipe openings
        const innerShadowHeight = 5;
        
        // Top pipe inner shadow
        const topGradient = ctx.createLinearGradient(0, this.gapTop - innerShadowHeight, 0, this.gapTop);
        topGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        topGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = topGradient;
        ctx.fillRect(this.x, this.gapTop - innerShadowHeight, this.width, innerShadowHeight);
        
        // Bottom pipe inner shadow
        const bottomGradient = ctx.createLinearGradient(0, this.gapBottom, 0, this.gapBottom + innerShadowHeight);
        bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(this.x, this.gapBottom, this.width, innerShadowHeight);
    }
    
    /**
     * Draw a rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} corners - Corner radii {topLeft, topRight, bottomLeft, bottomRight}
     */
    drawRoundedRect(ctx, x, y, width, height, corners = {}) {
        const defaultRadius = 0;
        const topLeft = corners.topLeft || defaultRadius;
        const topRight = corners.topRight || defaultRadius;
        const bottomLeft = corners.bottomLeft || defaultRadius;
        const bottomRight = corners.bottomRight || defaultRadius;
        
        ctx.beginPath();
        ctx.moveTo(x + topLeft, y);
        ctx.lineTo(x + width - topRight, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
        ctx.lineTo(x + width, y + height - bottomRight);
        ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
        ctx.lineTo(x + bottomLeft, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
        ctx.lineTo(x, y + topLeft);
        ctx.quadraticCurveTo(x, y, x + topLeft, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Check if bird collides with this pipe
     * @param {Bird} bird - The bird object
     * @returns {boolean} - Returns true if collision detected
     */
    checkCollision(bird) {
        if (bird.x + bird.radius > this.x && bird.x - bird.radius < this.x + this.width) {
            if (bird.y - bird.radius < this.gapTop || bird.y + bird.radius > this.gapBottom) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if bird has passed this pipe
     * @param {Bird} bird - The bird object
     * @returns {boolean} - Returns true if bird passed the pipe
     */
    checkPassed(bird) {
        if (!this.passed && bird.x > this.x + this.width) {
            this.passed = true;
            return true;
        }
        return false;
    }
}