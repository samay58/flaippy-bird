/**
 * Color palette for the background
 */
const COLORS = {
    // Night sky gradient colors
    skyTop: '#0f1028',
    skyUpper: '#1A1A2E',
    skyMiddle: '#16213E',
    skyBottom: '#1e3163',
    
    // Day sky gradient colors
    daySkyTop: '#1e56a0',    // Lighter blue
    daySkyUpper: '#3a7bd5',  // Mid blue
    daySkyMiddle: '#5d9eee', // Light blue
    daySkyBottom: '#83c9f4', // Very light blue
    
    // Island colors
    islandTop: '#2a3b5a',
    islandMiddle: '#1e2a47',
    islandBottom: '#131b2e',
    islandSurface: '#2d4863',
    
    // Mountain colors
    mountainBase: 'rgba(20, 24, 45, ',
    
    // Cloud colors
    cloudFill: 'rgba(255, 255, 255, 0.5)',
    cloudHighlight: 'rgba(255, 255, 255, 0.2)',
    
    // Star color
    star: 'white'
};

/**
 * Background class - Handles the game background with parallax effects
 */
export default class Background {
    /**
     * Create a new Background instance
     * @param {number} canvasWidth - Width of the game canvas
     * @param {number} canvasHeight - Height of the game canvas
     */
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Time tracking for animations
        this.time = 0;
        
        // Create parallax layers
        this.initializeBackground();
    }

    /**
     * Initialize background elements
     */
    initializeBackground() {
        // Create gradient shifts for animated background
        this.gradientShift = 0;
        this.gradientDirection = 1;
        this.gradientSpeed = 0.005;
        
        // Add day/night cycle transition
        this.dayNightCycle = 0; // 0 = night, 1 = day
        this.targetDayNightCycle = 0;
        this.dayNightTransitionSpeed = 0.2;
        
        // Create stars with different depths
        this.distantStars = this.generateStars(100, 0.1, 0.3, 'tiny');
        this.midStars = this.generateStars(50, 0.3, 0.7, 'medium');
        this.nearStars = this.generateStars(15, 0.7, 1.5, 'large');
        
        // Create nebula clouds
        this.nebulae = this.generateNebulae(5);
        
        // Create distant mountains
        this.mountains = this.generateMountains();
        
        // Create floating islands
        this.islands = this.generateIslands(3);
        
        // Create clouds
        this.clouds = this.generateClouds(8);
    }

    /**
     * Generate stars for the background
     * @param {number} count - Number of stars to generate
     * @param {number} minSpeed - Minimum speed
     * @param {number} maxSpeed - Maximum speed
     * @param {string} type - Type of stars ('tiny', 'medium', 'large')
     * @returns {Array} - Array of star objects
     */
    generateStars(count, minSpeed, maxSpeed, type) {
        const stars = [];
        
        for (let i = 0; i < count; i++) {
            let size, alpha, pulsate;
            
            // Set properties based on type
            if (type === 'tiny') {
                size = 1;
                alpha = 0.3 + Math.random() * 0.3;
                pulsate = false;
            } else if (type === 'medium') {
                size = 1.5 + Math.random();
                alpha = 0.5 + Math.random() * 0.3;
                pulsate = Math.random() > 0.7; // 30% chance to pulsate
            } else { // large
                size = 2 + Math.random() * 2;
                alpha = 0.7 + Math.random() * 0.3;
                pulsate = Math.random() > 0.3; // 70% chance to pulsate
            }
            
            stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                size: size,
                originalSize: size,
                speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
                alpha: alpha,
                originalAlpha: alpha,
                pulsate: pulsate,
                pulsePhase: Math.random() * Math.PI * 2, // Random starting phase
                pulseSpeed: 0.05 + Math.random() * 0.05,
                type: type,
                twinkle: type === 'large' && Math.random() > 0.5 // Large stars may twinkle
            });
        }
        
        return stars;
    }

    /**
     * Generate nebula clouds for the background
     * @param {number} count - Number of nebulae to generate
     * @returns {Array} - Array of nebula objects
     */
    generateNebulae(count) {
        const nebulae = [];
        const colors = [
            { r: 106, g: 76, b: 147, a: 0.1 },  // Purple
            { r: 59, g: 82, b: 128, a: 0.1 },   // Blue
            { r: 128, g: 59, b: 82, a: 0.1 },   // Pink
            { r: 76, g: 106, b: 147, a: 0.1 },  // Light blue
            { r: 128, g: 100, b: 59, a: 0.1 }   // Gold
        ];
        
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            nebulae.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                radius: this.canvasWidth * (0.3 + Math.random() * 0.5),
                color: color,
                speed: 0.05 + Math.random() * 0.1
            });
        }
        
        return nebulae;
    }

    /**
     * Generate mountain silhouettes for distant background
     * @returns {Array} - Array of mountain objects
     */
    generateMountains() {
        const mountains = [];
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            const darkness = 0.2 + (layer * 0.1); // Darker as layers get closer
            const speed = 0.2 + (layer * 0.3);    // Faster as layers get closer
            const height = 0.1 + (layer * 0.05);  // Taller as layers get closer
            const segmentCount = 5 + layer * 2;   // More detailed as layers get closer
            
            const segments = [];
            const segmentWidth = this.canvasWidth / (segmentCount - 1);
            
            // Generate a smooth mountain silhouette using noise
            for (let i = 0; i < segmentCount; i++) {
                // Use a simple algorithm for height variation
                const segHeight = (Math.sin(i * 0.5) * 0.5 + 0.5) * height * this.canvasHeight;
                segments.push({
                    x: i * segmentWidth,
                    y: this.canvasHeight - segHeight
                });
            }
            
            // Add duplicate points to allow for scrolling
            const extraSegments = Math.ceil(this.canvasWidth / segmentWidth) + 1;
            for (let i = 1; i <= extraSegments; i++) {
                segments.push({
                    x: segmentCount * segmentWidth + (i - 1) * segmentWidth,
                    y: segments[i % segmentCount].y
                });
            }
            
            mountains.push({
                segments: segments,
                color: `${COLORS.mountainBase}${darkness})`,
                speed: speed,
                offset: 0
            });
        }
        
        return mountains;
    }
    
    /**
     * Generate floating islands for mid-ground
     * @param {number} count - Number of islands to generate
     * @returns {Array} - Array of island objects
     */
    generateIslands(count) {
        const islands = [];
        
        for (let i = 0; i < count; i++) {
            const width = 100 + Math.random() * 150;
            const height = 40 + Math.random() * 60;
            const baseY = this.canvasHeight * (0.5 + Math.random() * 0.3);
            
            islands.push({
                x: this.canvasWidth + (i * this.canvasWidth / count),
                y: baseY,
                width: width,
                height: height,
                speed: 0.7 + Math.random() * 0.5,
                hoverAmplitude: 5 + Math.random() * 10,
                hoverFrequency: 0.001 + Math.random() * 0.002,
                hoverOffset: Math.random() * Math.PI * 2,
                shape: this.generateIslandShape(width, height)
            });
        }
        
        return islands;
    }
    
    /**
     * Generate the shape points for an island
     * @param {number} width - Width of the island
     * @param {number} height - Height of the island
     * @returns {Array} - Array of points defining the island shape
     */
    generateIslandShape(width, height) {
        const points = [];
        const segments = 12;
        
        // Top surface with gentle variations
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * width;
            let y = 0;
            
            // Add some randomness to the top surface
            if (i > 0 && i < segments) {
                y = (Math.sin(i / segments * Math.PI) * 0.2 - 0.1) * height;
            }
            
            points.push({ x, y });
        }
        
        // Bottom surface with more dramatic variations
        for (let i = segments; i >= 0; i--) {
            const x = (i / segments) * width;
            let y = height;
            
            // Make the bottom more rugged
            if (i > 0 && i < segments) {
                y = height * (0.7 + Math.sin(i / 2) * 0.3);
            }
            
            points.push({ x, y });
        }
        
        return points;
    }
    
    /**
     * Generate clouds for foreground
     * @param {number} count - Number of clouds to generate
     * @returns {Array} - Array of cloud objects
     */
    generateClouds(count) {
        const clouds = [];
        
        for (let i = 0; i < count; i++) {
            const width = 80 + Math.random() * 120;
            const height = 30 + Math.random() * 20;
            
            clouds.push({
                x: this.canvasWidth + (i * this.canvasWidth / (count - 1)),
                y: this.canvasHeight * (0.2 + Math.random() * 0.4),
                width: width,
                height: height,
                speed: 1 + Math.random() * 0.8,
                bubbles: this.generateCloudBubbles(width, height)
            });
        }
        
        return clouds;
    }
    
    /**
     * Generate bubble shapes for a cloud
     * @param {number} width - Width of the cloud
     * @param {number} height - Height of the cloud
     * @returns {Array} - Array of bubble objects
     */
    generateCloudBubbles(width, height) {
        const bubbles = [];
        const bubbleCount = Math.floor(3 + Math.random() * 4);
        
        // Main center bubble
        bubbles.push({
            x: width / 2,
            y: height / 2,
            radius: height / 2
        });
        
        // Add supporting bubbles
        for (let i = 0; i < bubbleCount; i++) {
            const angle = (i / bubbleCount) * Math.PI * 2;
            const distance = width * 0.4;
            const x = width / 2 + Math.cos(angle) * distance;
            const y = height / 2 + Math.sin(angle) * distance * 0.5;
            const radius = height * (0.3 + Math.random() * 0.2);
            
            bubbles.push({ x, y, radius });
        }
        
        return bubbles;
    }

    /**
     * Update background elements
     * @param {number} deltaTime - Time since last update
     * @param {number} score - Current game score for day/night transitions
     */
    update(deltaTime, score = 0) {
        // Increment time for animations
        this.time += deltaTime;
        
        // Update gradient animation
        this.gradientShift += this.gradientSpeed * this.gradientDirection * deltaTime;
        if (this.gradientShift > 0.2 || this.gradientShift < 0) {
            this.gradientDirection *= -1;
        }
        
        // Update day/night cycle based on score
        // Every 20 points, transition between day and night
        this.targetDayNightCycle = Math.floor(score / 20) % 2 === 0 ? 0 : 1;
        
        // Smooth transition between day and night
        if (this.dayNightCycle !== this.targetDayNightCycle) {
            if (this.targetDayNightCycle === 1) {
                // Transition to day
                this.dayNightCycle = Math.min(1, this.dayNightCycle + this.dayNightTransitionSpeed * deltaTime);
            } else {
                // Transition to night
                this.dayNightCycle = Math.max(0, this.dayNightCycle - this.dayNightTransitionSpeed * deltaTime);
            }
        }
        
        // Update stars
        this.updateStars(this.distantStars, deltaTime);
        this.updateStars(this.midStars, deltaTime);
        this.updateStars(this.nearStars, deltaTime);
        
        // Update nebulae
        this.nebulae.forEach(nebula => {
            nebula.x -= nebula.speed * deltaTime * 10;
            if (nebula.x + nebula.radius < -this.canvasWidth) {
                nebula.x = this.canvasWidth + nebula.radius;
                nebula.y = Math.random() * this.canvasHeight;
            }
        });
        
        // Update mountains (parallax scrolling)
        this.mountains.forEach(mountain => {
            mountain.offset = (mountain.offset + mountain.speed * deltaTime) % this.canvasWidth;
        });
        
        // Update islands
        this.islands.forEach(island => {
            island.x -= island.speed * deltaTime * 30;
            
            // Reset position when off screen
            if (island.x + island.width < 0) {
                island.x = this.canvasWidth;
                island.y = this.canvasHeight * (0.5 + Math.random() * 0.3);
                island.hoverOffset = Math.random() * Math.PI * 2;
            }
            
            // Hovering effect
            const hover = Math.sin(this.time * island.hoverFrequency + island.hoverOffset) * island.hoverAmplitude;
            island.currentY = island.y + hover;
        });
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * deltaTime * 50;
            
            // Reset position when off screen
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvasWidth;
                cloud.y = this.canvasHeight * (0.2 + Math.random() * 0.4);
            }
        });
    }
    
    /**
     * Update star animations
     * @param {Array} stars - Array of star objects to update
     * @param {number} deltaTime - Time since last update
     */
    updateStars(stars, deltaTime) {
        stars.forEach(star => {
            // Move star
            star.x -= star.speed * deltaTime * 30;
            
            // Reset position when off screen
            if (star.x < 0) {
                star.x = this.canvasWidth;
                star.y = Math.random() * this.canvasHeight;
                
                // Randomize pulsating behavior for some stars
                if (star.type !== 'tiny') {
                    star.pulsate = Math.random() > (star.type === 'medium' ? 0.7 : 0.3);
                }
            }
            
            // Pulsating effect
            if (star.pulsate) {
                star.pulsePhase += star.pulseSpeed * deltaTime;
                const pulseFactor = 0.2 * Math.sin(star.pulsePhase) + 1;
                star.size = star.originalSize * pulseFactor;
                star.alpha = Math.min(1, star.originalAlpha * pulseFactor);
            }
            
            // Twinkling effect for large stars
            if (star.twinkle) {
                const twinkleFactor = 0.5 * Math.sin(star.pulsePhase * 3) + 0.5;
                star.alpha = star.originalAlpha * (0.5 + twinkleFactor * 0.5);
            }
        });
    }

    /**
     * Draw the background on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        // Sky gradient with subtle animation
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        
        // Blend between night and day colors based on the cycle
        const topColor = this.blendColors(
            COLORS.skyTop, 
            COLORS.daySkyTop, 
            this.dayNightCycle
        );
        
        const upperColor = this.blendColors(
            COLORS.skyUpper, 
            COLORS.daySkyUpper, 
            this.dayNightCycle
        );
        
        const middleColor = this.blendColors(
            COLORS.skyMiddle, 
            COLORS.daySkyMiddle, 
            this.dayNightCycle
        );
        
        const bottomColor = this.blendColors(
            COLORS.skyBottom, 
            COLORS.daySkyBottom, 
            this.dayNightCycle
        );
        
        // Animated gradient stops
        gradient.addColorStop(0, this.shiftColor(topColor, this.gradientShift));
        gradient.addColorStop(0.3, this.shiftColor(upperColor, this.gradientShift));
        gradient.addColorStop(0.7, this.shiftColor(middleColor, this.gradientShift));
        gradient.addColorStop(1, this.shiftColor(bottomColor, this.gradientShift));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw nebulae
        this.drawNebulae(ctx);
        
        // Draw distant stars
        this.drawStars(ctx, this.distantStars);
        
        // Draw mountains
        this.drawMountains(ctx);
        
        // Draw mid-distance stars
        this.drawStars(ctx, this.midStars);
        
        // Draw islands
        this.drawIslands(ctx);
        
        // Draw near stars
        this.drawStars(ctx, this.nearStars);
        
        // Draw clouds
        this.drawClouds(ctx);
    }
    
    /**
     * Draw nebulae
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawNebulae(ctx) {
        this.nebulae.forEach(nebula => {
            const gradient = ctx.createRadialGradient(
                nebula.x, 
                nebula.y, 
                0,
                nebula.x, 
                nebula.y, 
                nebula.radius
            );
            
            const color = nebula.color;
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 2})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        });
    }
    
    /**
     * Draw stars
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} stars - Array of star objects to draw
     */
    drawStars(ctx, stars) {
        stars.forEach(star => {
            ctx.save();
            
            // Reduce star opacity during day
            const dayAlphaReduction = 1 - this.dayNightCycle * 0.8;
            
            // Set transparency
            ctx.globalAlpha = star.alpha * dayAlphaReduction;
            
            if (star.type === 'large' && Math.random() > 0.7) {
                // Draw some large stars with a glow effect
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 10;
            }
            
            // Draw the star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.star;
            ctx.fill();
            
            // For larger stars, add cross glints
            if (star.size > 2.5) {
                const glintSize = star.size * 2;
                ctx.beginPath();
                ctx.moveTo(star.x - glintSize, star.y);
                ctx.lineTo(star.x + glintSize, star.y);
                ctx.moveTo(star.x, star.y - glintSize);
                ctx.lineTo(star.x, star.y + glintSize);
                ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
            
            ctx.restore();
        });
    }
    
    /**
     * Draw mountain silhouettes
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawMountains(ctx) {
        this.mountains.forEach(mountain => {
            ctx.fillStyle = mountain.color;
            
            ctx.beginPath();
            const firstPoint = mountain.segments[0];
            ctx.moveTo(firstPoint.x - mountain.offset, firstPoint.y);
            
            // Draw mountain silhouette
            for (let i = 1; i < mountain.segments.length; i++) {
                const point = mountain.segments[i];
                ctx.lineTo(point.x - mountain.offset, point.y);
            }
            
            // Close the path by drawing to bottom corners
            ctx.lineTo(this.canvasWidth, this.canvasHeight);
            ctx.lineTo(0, this.canvasHeight);
            ctx.closePath();
            ctx.fill();
        });
    }
    
    /**
     * Draw floating islands
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawIslands(ctx) {
        this.islands.forEach(island => {
            ctx.save();
            ctx.translate(island.x, island.currentY || island.y);
            
            // Draw island
            ctx.beginPath();
            for (let i = 0; i < island.shape.length; i++) {
                const point = island.shape[i];
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.closePath();
            
            // Island gradient fill
            const gradient = ctx.createLinearGradient(0, -10, 0, island.height + 10);
            gradient.addColorStop(0, COLORS.islandTop);    // Top color
            gradient.addColorStop(0.4, COLORS.islandMiddle); // Middle color
            gradient.addColorStop(1, COLORS.islandBottom); // Bottom color
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw surface details (grass or rocks)
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            // Draw jagged surface
            const segmentWidth = island.width / 20;
            for (let i = 0; i <= 20; i++) {
                const x = i * segmentWidth;
                const y = (i % 2) ? -5 : 0;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(island.width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            
            ctx.fillStyle = COLORS.islandSurface;
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * Draw clouds
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawClouds(ctx) {
        this.clouds.forEach(cloud => {
            ctx.save();
            ctx.translate(cloud.x, cloud.y);
            
            // Draw cloud bubbles
            cloud.bubbles.forEach(bubble => {
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.fillStyle = COLORS.cloudFill;
                ctx.fill();
                
                // Add highlight
                ctx.beginPath();
                ctx.arc(bubble.x - bubble.radius * 0.2, bubble.y - bubble.radius * 0.2, 
                        bubble.radius * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = COLORS.cloudHighlight;
                ctx.fill();
            });
            
            ctx.restore();
        });
    }
    
    /**
     * Shift a color by adding/subtracting from its RGB values
     * @param {string} hex - Hex color string
     * @param {number} amount - Amount to shift by (-1 to 1)
     * @returns {string} - Shifted RGB color string
     */
    shiftColor(hex, amount) {
        // Convert hex to RGB
        let r, g, b;
        
        if (hex.startsWith('#')) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else if (hex.startsWith('rgb')) {
            // Extract RGB values from rgb() or rgba() string
            const rgbMatch = hex.match(/\d+/g);
            r = parseInt(rgbMatch[0]);
            g = parseInt(rgbMatch[1]);
            b = parseInt(rgbMatch[2]);
        } else {
            // Default values if color format is unrecognized
            r = g = b = 128;
        }
        
        // Apply shift amount (clamp between 0-255)
        r = Math.max(0, Math.min(255, r + Math.round(amount * 20)));
        g = Math.max(0, Math.min(255, g + Math.round(amount * 20)));
        b = Math.max(0, Math.min(255, b + Math.round(amount * 20)));
        
        // Convert back to RGB string
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Blend between two colors based on a ratio
     * @param {string} color1 - First color (hex)
     * @param {string} color2 - Second color (hex)
     * @param {number} ratio - Blend ratio (0-1)
     * @returns {string} - Blended color as hex
     */
    blendColors(color1, color2, ratio) {
        // Convert colors to RGB
        let r1, g1, b1, r2, g2, b2;
        
        // Parse first color
        if (color1.startsWith('#')) {
            r1 = parseInt(color1.slice(1, 3), 16);
            g1 = parseInt(color1.slice(3, 5), 16);
            b1 = parseInt(color1.slice(5, 7), 16);
        } else {
            // Default values if color format is unrecognized
            r1 = g1 = b1 = 0;
        }
        
        // Parse second color
        if (color2.startsWith('#')) {
            r2 = parseInt(color2.slice(1, 3), 16);
            g2 = parseInt(color2.slice(3, 5), 16);
            b2 = parseInt(color2.slice(5, 7), 16);
        } else {
            // Default values if color format is unrecognized
            r2 = g2 = b2 = 255;
        }
        
        // Linear interpolation
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
        
        // Convert back to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Update canvas dimensions
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        // Regenerate background elements for the new dimensions
        this.initializeBackground();
    }
}