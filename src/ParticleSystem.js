/**
 * ParticleSystem class - Handles particle effects for the game
 */
export default class ParticleSystem {
    /**
     * Create a new ParticleSystem instance
     */
    constructor() {
        this.particles = [];
    }

    /**
     * Create particles for a jump effect
     * @param {number} x - X position to create particles
     * @param {number} y - Y position to create particles
     * @param {string} color - Base color of particles
     */
    createJumpParticles(x, y, color) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI / 2) + (Math.random() * Math.PI / 4 - Math.PI / 8);
            const speed = 1 + Math.random() * 2;
            const size = 1 + Math.random() * 3;
            const lifetime = 0.5 + Math.random() * 0.5;
            const hue = this.getRandomHueFromColor(color);
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color: `hsl(${hue}, 100%, 75%)`,
                alpha: 1,
                lifetime,
                currentLife: 0,
                type: 'jump'
            });
        }
    }

    /**
     * Create particles for a collision effect
     * @param {number} x - X position to create particles
     * @param {number} y - Y position to create particles
     * @param {string} color - Base color of particles
     */
    createCollisionParticles(x, y, color) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            const lifetime = 0.8 + Math.random() * 0.7;
            const hue = this.getRandomHueFromColor(color);
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color: `hsl(${hue}, 100%, 65%)`,
                alpha: 1,
                lifetime,
                currentLife: 0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                type: 'collision'
            });
        }
    }

    /**
     * Create particles for scoring points
     * @param {number} x - X position to create particles
     * @param {number} y - Y position to create particles
     */
    createScoreParticles(x, y) {
        const particleCount = 15;
        const colors = ['#FFD700', '#FFFFFF', '#FFA500'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 1 + Math.random() * 3;
            const lifetime = 0.7 + Math.random() * 0.6;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5, // Slight upward bias
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                lifetime,
                currentLife: 0,
                type: 'score'
            });
        }
    }

    /**
     * Get a random hue based on a color string
     * @param {string} color - Base color
     * @returns {number} Hue value
     */
    getRandomHueFromColor(color) {
        // Extract hue or use default values based on color
        let hue = 45; // Default yellow hue
        
        if (color === '#FFD166') {
            hue = 45 + (Math.random() * 10 - 5); // Yellow range
        } else if (color.startsWith('#')) {
            // If it's another hex color, use a related hue
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            // Simple hue approximation
            if (r > g && r > b) hue = 0 + (Math.random() * 20 - 10); // Red
            else if (g > r && g > b) hue = 120 + (Math.random() * 20 - 10); // Green
            else if (b > r && b > g) hue = 240 + (Math.random() * 20 - 10); // Blue
        }
        
        return hue;
    }

    /**
     * Update all particles in the system
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update lifetime
            particle.currentLife += deltaTime;
            
            // Remove dead particles
            if (particle.currentLife >= particle.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Calculate life ratio (0-1)
            const lifeRatio = particle.currentLife / particle.lifetime;
            
            // Update alpha
            particle.alpha = 1 - lifeRatio;
            
            // Update size for some effect types
            if (particle.type === 'score') {
                particle.size *= 0.99;
            } else if (particle.type === 'jump') {
                particle.size *= 0.97;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity to collision particles
            if (particle.type === 'collision') {
                particle.vy += 0.1;
                
                // Update rotation if applicable
                if (particle.rotation !== undefined) {
                    particle.rotation += particle.rotationSpeed;
                }
            }
        }
    }

    /**
     * Clear all particles
     */
    clearParticles() {
        this.particles = [];
    }
    
    /**
     * Draw all particles in the system
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        ctx.save();
        
        // Draw each particle
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.alpha;
            
            if (particle.type === 'collision') {
                // Draw shapes for collision particles
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation || 0);
                
                ctx.fillStyle = particle.color;
                
                // Determine shape based on index or property
                const shape = particle.shape || ['circle', 'triangle', 'square'][Math.floor(Math.random() * 3)];
                
                if (shape === 'triangle') {
                    // Triangle
                    ctx.beginPath();
                    ctx.moveTo(0, -particle.size);
                    ctx.lineTo(particle.size, particle.size);
                    ctx.lineTo(-particle.size, particle.size);
                    ctx.closePath();
                    ctx.fill();
                } else if (shape === 'square') {
                    // Square
                    ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                } else {
                    // Circle (default)
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                }
                
                ctx.restore();
            } else if (particle.type === 'score') {
                // Star shape for score particles
                const outerRadius = particle.size;
                const innerRadius = particle.size / 2;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.beginPath();
                
                // Draw a star shape
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(
                        Math.cos((i * 4 * Math.PI) / 5) * outerRadius,
                        Math.sin((i * 4 * Math.PI) / 5) * outerRadius
                    );
                    ctx.lineTo(
                        Math.cos((i * 4 * Math.PI) / 5 + Math.PI / 5) * innerRadius,
                        Math.sin((i * 4 * Math.PI) / 5 + Math.PI / 5) * innerRadius
                    );
                }
                
                ctx.closePath();
                ctx.fillStyle = particle.color;
                ctx.fill();
                ctx.restore();
            } else {
                // Simple circle for jump particles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
                ctx.closePath();
            }
        }
        
        ctx.restore();
    }
}