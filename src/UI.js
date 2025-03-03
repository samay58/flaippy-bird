/**
 * UI class - Handles modern UI elements, animations, and interactions
 */
export default class UI {
    /**
     * Create a new UI instance
     * @param {HTMLCanvasElement} canvas - Game canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.elements = {};
        this.isVisible = false;
        this.hoveredButton = null;
        this.activeScreen = null;
        
        console.log("UI initialized with canvas:", canvas.width, "x", canvas.height);
        
        // Font family settings using CSS variables for consistency
        this.fonts = {
            title: "var(--font-primary)",
            body: "var(--font-secondary)",
            retro: "var(--font-primary)"
        };
        
        // Color palette for UI elements
        this.colors = {
            primary: '#3498db',     // Blue
            secondary: '#2ecc71',   // Green
            accent: '#f39c12',      // Orange
            danger: '#e74c3c',      // Red
            dark: '#2c3e50',        // Dark blue
            light: '#ecf0f1',       // Light gray
            shadow: 'rgba(0, 0, 0, 0.5)',
            retro: {
                green: '#39ff14',   // Electric neon green
                darkGreen: '#32cd32', // Lime green
                blue: '#00ffff',    // Cyan/Aqua
                darkBlue: '#0080ff', // Medium blue
                pink: '#ff00ff',    // Magenta
                yellow: '#ffff00',  // Yellow
                orange: '#ff7700',  // Orange
                red: '#ff0000',     // Red
                purple: '#9900ff',  // Purple
                text: '#ffffff',    // White text
                darkText: '#111111', // Almost black text
                textShadow: 'rgba(0, 0, 0, 0.7)', // Text shadow
                glow: 'rgba(255, 255, 255, 0.8)'  // Glow effect
            }
        };
        
        // Animation durations
        this.animations = {
            fadeIn: 0.3,
            fadeOut: 0.2,
            buttonHover: 0.15,
            slideIn: 0.5,
            hardPress: {
                scaleDown: 0.1,   // Duration to scale down
                scaleUp: 0.15     // Duration to scale back up
            }
        };
        
        // Set up the UI elements for each screen
        this.setupUI();
        
        // Add event listeners for mouse/touch interactions
        this.setupEventListeners();
        
        console.log("UI setup complete - retro styles and buttons configured");
    }
    
    /**
     * Set up all UI elements for each screen
     */
    setupUI() {
        // Common metrics
        const buttonHeight = 50;
        const buttonWidth = 180;
        const buttonMargin = 20;
        
        // Title Screen UI
        this.elements.titleScreen = {
            title: {
                type: 'text',
                text: 'FLAIPPY BIRD',
                font: `bold 48px ${this.fonts.retro}`,
                color: this.colors.retro.yellow,
                x: 0.5,
                y: 0.35,
                align: 'center',
                baseline: 'middle',
                shadow: true,
                shadowColor: 'rgba(255, 255, 0, 0.5)',
                shadowBlur: 15,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                animation: {
                    type: 'float',
                    amplitude: 5,
                    frequency: 0.001
                }
            },
            titleGlow: {
                type: 'text',
                text: 'FLAIPPY BIRD',
                font: `bold 48px ${this.fonts.retro}`,
                color: 'rgba(255, 255, 0, 0.2)',
                x: 0.5,
                y: 0.35,
                align: 'center',
                baseline: 'middle',
                shadow: true,
                shadowColor: 'rgba(255, 255, 0, 0.5)',
                shadowBlur: 25,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                zIndex: -1,
                animation: {
                    type: 'pulse',
                    scale: 1.1,
                    duration: 2
                }
            },
            startButton: {
                type: 'button',
                text: 'PLAY',
                font: `bold 24px ${this.fonts.retro}`,
                x: 0.5,
                y: 0.55,
                width: buttonWidth,
                height: buttonHeight,
                action: 'start',
                fillColor: this.colors.retro.green,
                hoverColor: this.colors.retro.darkGreen,
                textColor: this.colors.retro.text,
                align: 'center',
                cornerRadius: 5,
                borderColor: this.colors.retro.darkGreen,
                borderWidth: 2,
                shadow: true,
                shadowColor: 'rgba(57, 255, 20, 0.5)',
                shadowBlur: 10,
                animation: {
                    type: 'pulse',
                    scale: 1.05,
                    duration: 1.5
                }
            },
            settingsButton: {
                type: 'button',
                text: 'SETTINGS',
                font: `bold 20px ${this.fonts.retro}`,
                x: 0.5,
                y: 0.55 + (buttonHeight + buttonMargin) / this.canvas.height,
                width: buttonWidth,
                height: buttonHeight,
                action: 'settings',
                fillColor: this.colors.retro.blue,
                hoverColor: this.colors.retro.darkBlue,
                textColor: this.colors.retro.text,
                align: 'center',
                cornerRadius: 5,
                borderColor: this.colors.retro.darkBlue,
                borderWidth: 2,
                shadow: true,
                shadowColor: 'rgba(0, 255, 255, 0.5)',
                shadowBlur: 10
            },
            highScoreText: {
                type: 'text',
                text: 'HIGH SCORE: 0',
                font: `18px ${this.fonts.retro}`,
                color: this.colors.retro.orange,
                x: 0.5,
                y: 0.8,
                align: 'center',
                baseline: 'middle',
                shadow: true,
                shadowColor: 'rgba(255, 119, 0, 0.5)',
                shadowBlur: 8
            },
            versionText: {
                type: 'text',
                text: 'v2.1',
                font: `14px ${this.fonts.retro}`,
                color: this.colors.retro.purple,
                x: 0.95,
                y: 0.97,
                align: 'right',
                baseline: 'bottom',
                shadow: true,
                shadowColor: 'rgba(153, 0, 255, 0.5)',
                shadowBlur: 5
            }
        };
        
        // Game Over Screen UI
        this.elements.gameOverScreen = {
            gameOverText: {
                type: 'text',
                text: 'GAME OVER',
                font: `bold 32px ${this.fonts.retro}`,
                color: this.colors.retro.red,
                x: 0.9,
                y: 0.1,
                align: 'right',
                baseline: 'top',
                shadow: true,
                shadowColor: 'rgba(255, 0, 0, 0.5)',
                shadowBlur: 12,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                animation: {
                    type: 'pulseFade',
                    duration: 1.2,
                    minAlpha: 0.7,
                    maxAlpha: 1.0
                }
            },
            scorePanel: {
                type: 'panel',
                x: 0.5,
                y: 0.45,
                width: 0.8,
                height: 0.2,
                fillColor: 'rgba(52, 73, 94, 0.8)',
                cornerRadius: 15,
                borderColor: this.colors.light,
                borderWidth: 2,
                animation: {
                    type: 'fadeIn',
                    delay: 0.3
                }
            },
            scoreText: {
                type: 'text',
                text: 'SCORE: 0',
                font: `24px ${this.fonts.body}`,
                color: this.colors.light,
                x: 0.5,
                y: 0.45,
                align: 'center',
                baseline: 'middle'
            },
            highScoreText: {
                type: 'text',
                text: 'HIGH SCORE: 0',
                font: `20px ${this.fonts.body}`,
                color: this.colors.accent,
                x: 0.5,
                y: 0.52,
                align: 'center',
                baseline: 'middle'
            },
            restartButton: {
                type: 'button',
                text: 'PLAY AGAIN',
                font: `bold 22px ${this.fonts.body}`,
                x: 0.5,
                y: 0.7,
                width: buttonWidth,
                height: buttonHeight,
                action: 'restart',
                fillColor: this.colors.secondary,
                hoverColor: '#27ae60',
                textColor: this.colors.light,
                align: 'center',
                cornerRadius: 25,
                animation: {
                    type: 'slideIn',
                    direction: 'up',
                    delay: 0.5
                }
            },
            menuButton: {
                type: 'button',
                text: 'MAIN MENU',
                font: `bold 20px ${this.fonts.body}`,
                x: 0.5,
                y: 0.7 + (buttonHeight + buttonMargin) / this.canvas.height,
                width: buttonWidth,
                height: buttonHeight,
                action: 'menu',
                fillColor: this.colors.primary,
                hoverColor: '#2980b9',
                textColor: this.colors.light,
                align: 'center',
                cornerRadius: 25,
                animation: {
                    type: 'slideIn',
                    direction: 'up',
                    delay: 0.6
                }
            }
        };
        
        // Settings Screen UI
        this.elements.settingsScreen = {
            title: {
                type: 'text',
                text: 'SETTINGS',
                font: `bold 36px ${this.fonts.title}`,
                color: this.colors.light,
                x: 0.5,
                y: 0.2,
                align: 'center',
                baseline: 'middle',
                shadow: true
            },
            backButton: {
                type: 'button',
                text: 'BACK',
                font: `bold 20px ${this.fonts.body}`,
                x: 0.5,
                y: 0.8,
                width: buttonWidth,
                height: buttonHeight,
                action: 'menu',
                fillColor: this.colors.primary,
                hoverColor: '#2980b9',
                textColor: this.colors.light,
                align: 'center',
                cornerRadius: 25
            }
        };
        
        // HUD elements during gameplay
        this.elements.hud = {
            scoreText: {
                type: 'text',
                text: '0',
                font: `bold 36px ${this.fonts.retro}`,
                color: this.colors.retro.yellow,
                x: 0.9,
                y: 0.05,
                align: 'right',
                baseline: 'top',
                shadow: true,
                shadowColor: this.colors.retro.textShadow,
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                animation: {
                    type: 'pulse',
                    scale: 1.05,
                    duration: 0.5
                }
            },
            highScoreText: {
                type: 'text',
                text: 'HIGH: 0',
                font: `16px ${this.fonts.retro}`,
                color: this.colors.retro.blue,
                x: 0.9,
                y: 0.11,
                align: 'right',
                baseline: 'top',
                shadow: true,
                shadowColor: this.colors.retro.textShadow,
                shadowBlur: 4
            },
            pauseButton: {
                type: 'iconButton',
                icon: 'pause',
                x: 0.95,
                y: 0.05,
                radius: 20,
                action: 'pause',
                fillColor: 'rgba(0, 0, 0, 0.5)',
                hoverColor: 'rgba(0, 0, 0, 0.7)',
                iconColor: this.colors.retro.pink,
                shadow: true,
                shadowColor: 'rgba(255, 0, 255, 0.5)',
                shadowBlur: 8
            },
            startButton: {
                type: 'button',
                text: 'START',
                font: `16px ${this.fonts.retro}`,
                x: 0.85, 
                y: 0.17,
                width: 100,
                height: 40,
                action: 'start', // Fixed action from 'restart' to 'start'
                fillColor: this.colors.retro.green,
                hoverColor: this.colors.retro.darkGreen,
                textColor: this.colors.retro.text,
                align: 'center',
                cornerRadius: 5,
                borderColor: this.colors.retro.darkGreen,
                borderWidth: 2,
                shadow: true,
                shadowColor: 'rgba(57, 255, 20, 0.5)',
                shadowBlur: 10,
                animation: {
                    type: 'hardPress',
                    scaleDown: 0.95,
                    pressDuration: 0.1,
                    releaseDuration: 0.15
                },
                zIndex: 10 // Add zIndex to make sure it's above other elements
            }
        };
        
        // Pause screen elements
        this.elements.pauseScreen = {
            overlay: {
                type: 'panel',
                x: 0.5,
                y: 0.5,
                width: 1,
                height: 1,
                fillColor: 'rgba(0, 0, 0, 0.7)'
            },
            pauseText: {
                type: 'text',
                text: 'PAUSED',
                font: `bold 40px ${this.fonts.title}`,
                color: this.colors.light,
                x: 0.5,
                y: 0.4,
                align: 'center',
                baseline: 'middle',
                shadow: true
            },
            resumeButton: {
                type: 'button',
                text: 'RESUME',
                font: `bold 22px ${this.fonts.body}`,
                x: 0.5,
                y: 0.55,
                width: buttonWidth,
                height: buttonHeight,
                action: 'resume',
                fillColor: this.colors.secondary,
                hoverColor: '#27ae60',
                textColor: this.colors.light,
                align: 'center',
                cornerRadius: 25
            },
            menuButton: {
                type: 'button',
                text: 'MAIN MENU',
                font: `bold 20px ${this.fonts.body}`,
                x: 0.5,
                y: 0.55 + (buttonHeight + buttonMargin) / this.canvas.height,
                width: buttonWidth,
                height: buttonHeight,
                action: 'menu',
                fillColor: this.colors.primary,
                hoverColor: '#2980b9',
                textColor: this.colors.light,
                align: 'center',
                cornerRadius: 25
            }
        };
    }
    
    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Mouse move handler
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isVisible || !this.activeScreen) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.canvas.width;
            const y = (e.clientY - rect.top) / this.canvas.height;
            
            // Check for button hover
            this.hoveredButton = null;
            
            // Only check buttons in the active screen
            const screenElements = this.elements[this.activeScreen];
            if (!screenElements) return;
            
            for (const [id, element] of Object.entries(screenElements)) {
                if (element.type === 'button' || element.type === 'iconButton') {
                    if (this.isPointInButton(x, y, element)) {
                        this.hoveredButton = id;
                        this.canvas.style.cursor = 'pointer';
                        break;
                    }
                }
            }
            
            if (!this.hoveredButton) {
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Click handler
        this.canvas.addEventListener('click', (e) => {
            if (!this.isVisible || !this.activeScreen) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.canvas.width;
            const y = (e.clientY - rect.top) / this.canvas.height;
            
            // Check for button clicks
            const screenElements = this.elements[this.activeScreen];
            if (!screenElements) return;
            
            for (const [id, element] of Object.entries(screenElements)) {
                if ((element.type === 'button' || element.type === 'iconButton') && this.isPointInButton(x, y, element)) {
                    this.handleButtonClick(element.action, element);
                    break;
                }
            }
        });
        
        // Touch handlers for mobile devices
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.isVisible || !this.activeScreen) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = (touch.clientX - rect.left) / this.canvas.width;
            const y = (touch.clientY - rect.top) / this.canvas.height;
            
            // Check if touch is on a button
            const screenElements = this.elements[this.activeScreen];
            if (!screenElements) return;
            
            for (const [id, element] of Object.entries(screenElements)) {
                if ((element.type === 'button' || element.type === 'iconButton') && this.isPointInButton(x, y, element)) {
                    // Set as hovered to show visual feedback
                    this.hoveredButton = id;
                    break;
                }
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (!this.isVisible || !this.activeScreen || !this.hoveredButton) return;
            
            const element = this.elements[this.activeScreen][this.hoveredButton];
            if (element) {
                this.handleButtonClick(element.action, element);
            }
            
            this.hoveredButton = null;
        });
    }
    
    /**
     * Check if a point is inside a button
     * @param {number} x - X coordinate (0-1)
     * @param {number} y - Y coordinate (0-1)
     * @param {Object} button - Button element
     * @returns {boolean} - Whether point is in button
     */
    isPointInButton(x, y, button) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        if (button.type === 'iconButton') {
            // For circular icon buttons
            const buttonX = button.x * canvasWidth;
            const buttonY = button.y * canvasHeight;
            const pointX = x * canvasWidth;
            const pointY = y * canvasHeight;
            
            // Distance from center
            const distance = Math.sqrt(
                Math.pow(pointX - buttonX, 2) + 
                Math.pow(pointY - buttonY, 2)
            );
            
            return distance <= button.radius;
        } else {
            // For rectangular buttons
            const buttonX = (button.x * canvasWidth) - (button.width / 2);
            const buttonY = (button.y * canvasHeight) - (button.height / 2);
            
            return x * canvasWidth >= buttonX && 
                   x * canvasWidth <= buttonX + button.width &&
                   y * canvasHeight >= buttonY && 
                   y * canvasHeight <= buttonY + button.height;
        }
    }
    
    /**
     * Handle button click actions
     * @param {string} action - Button action
     * @param {Object} element - Button element that was clicked
     */
    handleButtonClick(action, element) {
        // Add haptic feedback (vibration) for mobile devices
        this.addHapticFeedback();
        
        // Apply hard press animation if configured
        if (element && element.animation && element.animation.type === 'hardPress') {
            // Create a GSAP timeline for the button press effect
            const timeline = gsap.timeline();
            const scaleDown = element.animation.scaleDown || 0.95;
            const pressDuration = element.animation.pressDuration || 0.1;
            const releaseDuration = element.animation.releaseDuration || 0.15;
            
            // Store the original button scale
            element.originalScale = element.originalScale || 1;
            
            // Scale down and then back up with ease
            timeline.to(element, {
                duration: pressDuration,
                scale: scaleDown * element.originalScale,
                ease: "power2.in"
            }).to(element, {
                duration: releaseDuration,
                scale: element.originalScale,
                ease: "elastic.out(1.2, 0.5)"
            });
            
            // Play click sound - implemented as method for easy disabling/customization
            this.playButtonSound('click');
        }
        
        // Process the action
        this.processButtonAction(action);
    }
    
    /**
     * Add haptic feedback using Vibration API for mobile devices
     */
    addHapticFeedback() {
        // Check if vibration API is available
        if (navigator.vibrate) {
            // Short vibration for button press (20ms)
            navigator.vibrate(20);
        }
    }
    
    /**
     * Play button sound effect
     * @param {string} type - Type of sound to play
     */
    playButtonSound(type) {
        // This is a placeholder for sound implementation
        // Could be connected to a sound system later
        // console.log(`Playing ${type} sound effect`);
    }
    
    /**
     * Process the button action
     * @param {string} action - Button action
     */
    processButtonAction(action) {
        console.log("Processing button action:", action); // Debug
        
        if (!this.callbacks) {
            console.error("No callbacks defined in UI - did you forget to call setCallbacks()?");
            return;
        }
        
        switch (action) {
            case 'start':
            case 'restart':
                if (this.callbacks.onStart) {
                    console.log("Calling onStart callback");
                    this.callbacks.onStart();
                } else {
                    console.error("onStart callback not defined");
                }
                break;
            case 'menu':
                this.showScreen('titleScreen');
                if (this.callbacks.onMenu) {
                    this.callbacks.onMenu();
                }
                break;
            case 'settings':
                this.showScreen('settingsScreen');
                break;
            case 'pause':
                this.showScreen('pauseScreen');
                if (this.callbacks.onPause) {
                    this.callbacks.onPause();
                }
                break;
            case 'resume':
                this.showHUD();
                if (this.callbacks.onResume) {
                    this.callbacks.onResume();
                }
                break;
            default:
                console.warn("Unknown action:", action);
                break;
        }
    }
    
    /**
     * Show the title screen
     */
    showTitleScreen() {
        this.showScreen('titleScreen');
    }
    
    /**
     * Show the game over screen
     * @param {number} score - Final score
     * @param {number} highScore - High score
     */
    showGameOverScreen(score, highScore) {
        // Update score text
        this.elements.gameOverScreen.scoreText.text = `SCORE: ${score}`;
        this.elements.gameOverScreen.highScoreText.text = `HIGH SCORE: ${highScore}`;
        
        // Show new high score indicator if applicable
        if (score === highScore && score > 0) {
            this.elements.gameOverScreen.highScoreText.color = '#f1c40f'; // Gold color
            this.elements.gameOverScreen.highScoreText.text = `NEW HIGH SCORE: ${highScore}!`;
        } else {
            this.elements.gameOverScreen.highScoreText.color = this.colors.accent;
        }
        
        this.showScreen('gameOverScreen');
    }
    
    /**
     * Show the HUD during gameplay
     */
    showHUD() {
        this.activeScreen = 'hud';
        this.isVisible = true;
        console.log("HUD activated - showing UI elements:", Object.keys(this.elements.hud));
    }
    
    /**
     * Show a specific UI screen
     * @param {string} screenName - Name of the screen to show
     */
    showScreen(screenName) {
        if (!this.elements[screenName]) return;
        
        this.activeScreen = screenName;
        this.isVisible = true;
        
        // Reset animations for this screen
        Object.values(this.elements[screenName]).forEach(element => {
            if (element.animation) {
                element.animationProgress = 0;
                element.animationStart = Date.now();
            }
        });
    }
    
    /**
     * Update the score display
     * @param {number} score - Current score
     * @param {number} highScore - High score
     */
    updateScore(score, highScore) {
        if (this.elements.hud.scoreText) {
            this.elements.hud.scoreText.text = score.toString();
        }
        
        if (this.elements.hud.highScoreText) {
            this.elements.hud.highScoreText.text = `HIGH: ${highScore}`;
        }
        
        if (this.elements.titleScreen.highScoreText) {
            this.elements.titleScreen.highScoreText.text = `HIGH SCORE: ${highScore}`;
        }
    }
    
    /**
     * Set callback functions
     * @param {Object} callbacks - Object containing callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = {
            onStart: callbacks.onStart || (() => {}),
            onMenu: callbacks.onMenu || (() => {}),
            onPause: callbacks.onPause || (() => {}),
            onResume: callbacks.onResume || (() => {})
        };
    }
    
    /**
     * Update animations
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.isVisible || !this.activeScreen) return;
        
        const now = Date.now();
        const screenElements = this.elements[this.activeScreen];
        
        // Update animations for active screen elements
        Object.entries(screenElements).forEach(([id, element]) => {
            if (element.animation) {
                // Initialize animation start time if needed
                if (!element.animationStart) {
                    element.animationStart = now;
                    element.animationProgress = 0;
                }
                
                // Calculate animation progress
                const delay = element.animation.delay || 0;
                const elapsed = (now - element.animationStart) / 1000 - delay;
                
                if (elapsed >= 0) {
                    if (element.animation.playOnce && element.animationComplete) {
                        // Skip if one-time animation is complete
                        return;
                    }
                    
                    const duration = element.animation.duration || 1;
                    element.animationProgress = Math.min(elapsed / duration, 1);
                    
                    if (element.animation.playOnce && element.animationProgress >= 1) {
                        element.animationComplete = true;
                    }
                    
                    // Special handling for GSAP-controlled animations
                    if (element.animation.type === 'hardPress') {
                        // GSAP handles this animation independently
                    }
                }
            }
        });
    }
    
    /**
     * Draw the UI
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        if (!this.isVisible || !this.activeScreen) return;
        
        const screenElements = this.elements[this.activeScreen];
        if (!screenElements) return;
        
        console.log("Drawing UI screen:", this.activeScreen);
        
        // Sort elements by z-index (if any)
        const sortedElements = Object.entries(screenElements).sort((a, b) => {
            return (a[1].zIndex || 0) - (b[1].zIndex || 0);
        });
        
        // Draw each element
        for (const [id, element] of sortedElements) {
            // Skip elements with no draw function
            const drawMethodName = `draw${element.type.charAt(0).toUpperCase() + element.type.slice(1)}`;
            if (!this[drawMethodName]) {
                console.warn(`No draw method found for element type: ${element.type}`);
                continue;
            }
            
            // Draw the element
            ctx.save();
            this[drawMethodName](ctx, element, id === this.hoveredButton);
            ctx.restore();
        }
    }
    
    /**
     * Draw a text element
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} element - Text element to draw
     */
    drawText(ctx, element) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Apply animation if any
        let x = element.x * canvasWidth;
        let y = element.y * canvasHeight;
        let alpha = 1;
        let scale = 1;
        
        if (element.animation) {
            switch (element.animation.type) {
                case 'float':
                    y += Math.sin(Date.now() * element.animation.frequency) * element.animation.amplitude;
                    break;
                    
                case 'fadeIn':
                    alpha = element.animationProgress || 0;
                    break;
                    
                case 'shake':
                    if (element.animationProgress < 1) {
                        const shakeAmount = (1 - element.animationProgress) * element.animation.amplitude;
                        x += Math.random() * shakeAmount * 2 - shakeAmount;
                        y += Math.random() * shakeAmount * 2 - shakeAmount;
                    }
                    break;
                    
                case 'pulse':
                    const pulseAmount = Math.sin(Date.now() / 1000 * Math.PI) * 0.05 + 0.95;
                    scale = 1 + (element.animation.scale - 1) * pulseAmount;
                    break;
                    
                case 'pulseFade':
                    const minAlpha = element.animation.minAlpha || 0.7;
                    const maxAlpha = element.animation.maxAlpha || 1.0;
                    const alphaRange = maxAlpha - minAlpha;
                    // Use sine wave to create pulsing effect
                    alpha = minAlpha + (Math.sin(Date.now() / 1000 * Math.PI) + 1) / 2 * alphaRange;
                    
                    // Add a subtle scale pulse as well for more dramatic effect
                    scale = 1 + Math.sin(Date.now() / 750) * 0.03;
                    break;
            }
        }
        
        // Set text properties
        ctx.font = element.font;
        ctx.textAlign = element.align || 'center';
        ctx.textBaseline = element.baseline || 'middle';
        
        // Add shadow if specified
        if (element.shadow) {
            ctx.shadowColor = element.shadowColor || 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = element.shadowBlur || 5;
            ctx.shadowOffsetX = element.shadowOffsetX || 2;
            ctx.shadowOffsetY = element.shadowOffsetY || 2;
        }
        
        // Draw text with alpha
        ctx.globalAlpha = alpha;
        ctx.fillStyle = element.color;
        ctx.fillText(element.text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    /**
     * Draw a button element
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} element - Button element to draw
     * @param {boolean} isHovered - Whether button is hovered
     */
    drawButton(ctx, element, isHovered) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Base button position and size
        let x = element.x * canvasWidth - element.width / 2;
        let y = element.y * canvasHeight - element.height / 2;
        let width = element.width;
        let height = element.height;
        let alpha = 1;
        let scale = element.scale || 1;
        
        // Apply animation if any
        if (element.animation) {
            switch (element.animation.type) {
                case 'pulse':
                    const pulseAmount = Math.sin(Date.now() / 1000 * Math.PI) * 0.05 + 0.95;
                    scale = 1 + (element.animation.scale - 1) * pulseAmount;
                    break;
                    
                case 'slideIn':
                    const progress = element.animationProgress || 1;
                    if (element.animation.direction === 'up') {
                        y = (element.y * canvasHeight - element.height / 2) + (1 - progress) * 100;
                    } else if (element.animation.direction === 'down') {
                        y = (element.y * canvasHeight - element.height / 2) - (1 - progress) * 100;
                    } else if (element.animation.direction === 'left') {
                        x = (element.x * canvasWidth - element.width / 2) + (1 - progress) * 100;
                    } else if (element.animation.direction === 'right') {
                        x = (element.x * canvasWidth - element.width / 2) - (1 - progress) * 100;
                    }
                    alpha = progress;
                    break;
                    
                case 'fadeIn':
                    alpha = element.animationProgress || 1;
                    break;
                    
                case 'hardPress':
                    // This is handled by GSAP in the click handler
                    // Just use the scale property that GSAP updates
                    if (!element.originalScale) {
                        element.originalScale = 1;
                    }
                    break;
            }
        }
        
        // Apply scaling
        if (scale !== 1) {
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            x = centerX - width * scale / 2;
            y = centerY - height * scale / 2;
            width *= scale;
            height *= scale;
        }
        
        // Set colors based on hover state
        const fillColor = isHovered ? element.hoverColor : element.fillColor;
        
        // Add shadow if specified
        if (element.shadow) {
            ctx.shadowColor = element.shadowColor || 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = element.shadowBlur || 5;
            ctx.shadowOffsetX = element.shadowOffsetX || 2;
            ctx.shadowOffsetY = element.shadowOffsetY || 2;
        }
        
        // Draw button with rounded corners
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fillColor;
        
        // Draw rounded rectangle
        const radius = element.cornerRadius || 5;
        this.drawRoundedRect(ctx, x, y, width, height, radius);
        
        // Draw border if specified
        if (element.borderColor) {
            ctx.shadowColor = 'transparent'; // Turn off shadow for border
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = element.borderWidth || 2;
            this.drawRoundedRect(ctx, x, y, width, height, radius, true);
        }
        
        // Reset shadow for text
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw button text with its own shadow
        ctx.font = element.font;
        ctx.fillStyle = element.textColor || 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(element.text, x + width / 2, y + height / 2);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add hover effect
        if (isHovered) {
            // Draw glow effect
            ctx.shadowColor = element.hoverColor || fillColor;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 2;
            ctx.strokeStyle = element.textColor || 'rgba(255, 255, 255, 0.7)';
            this.drawRoundedRect(ctx, x, y, width, height, radius, true);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * Draw an icon button element
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} element - Icon button element to draw
     * @param {boolean} isHovered - Whether button is hovered
     */
    drawIconButton(ctx, element, isHovered) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        const x = element.x * canvasWidth;
        const y = element.y * canvasHeight;
        const radius = element.radius;
        
        // Add shadow if specified
        if (element.shadow) {
            ctx.shadowColor = element.shadowColor || 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = element.shadowBlur || 5;
            ctx.shadowOffsetX = element.shadowOffsetX || 2;
            ctx.shadowOffsetY = element.shadowOffsetY || 2;
        }
        
        // Fill circular button
        ctx.fillStyle = isHovered ? element.hoverColor : element.fillColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow for icon
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw icon
        ctx.fillStyle = element.iconColor || 'white';
        
        if (element.icon === 'pause') {
            // Draw pause icon (two vertical bars)
            const barWidth = radius * 0.25;
            const barHeight = radius * 0.7;
            const barSpacing = radius * 0.25;
            
            ctx.fillRect(x - barWidth - barSpacing/2, y - barHeight/2, barWidth, barHeight);
            ctx.fillRect(x + barSpacing/2, y - barHeight/2, barWidth, barHeight);
        } else if (element.icon === 'play') {
            // Draw play icon (triangle)
            ctx.beginPath();
            ctx.moveTo(x + radius * 0.4, y);
            ctx.lineTo(x - radius * 0.2, y - radius * 0.4);
            ctx.lineTo(x - radius * 0.2, y + radius * 0.4);
            ctx.closePath();
            ctx.fill();
        }
        
        // Add hover effect
        if (isHovered) {
            ctx.strokeStyle = element.iconColor || 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Add glow effect when hovered
            ctx.shadowColor = element.iconColor || 'white';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    }
    
    /**
     * Draw a panel element
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} element - Panel element to draw
     */
    drawPanel(ctx, element) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        let width = typeof element.width === 'number' ? 
            (element.width > 1 ? element.width : element.width * canvasWidth) : 
            canvasWidth * 0.8;
            
        let height = typeof element.height === 'number' ? 
            (element.height > 1 ? element.height : element.height * canvasHeight) : 
            canvasHeight * 0.5;
        
        const x = element.x * canvasWidth - width / 2;
        const y = element.y * canvasHeight - height / 2;
        let alpha = 1;
        
        // Apply animation if any
        if (element.animation) {
            switch (element.animation.type) {
                case 'fadeIn':
                    alpha = element.animationProgress || 1;
                    break;
            }
        }
        
        // Draw panel background
        ctx.globalAlpha = alpha;
        ctx.fillStyle = element.fillColor || 'rgba(0, 0, 0, 0.7)';
        
        // Draw rounded rectangle if cornerRadius is specified
        if (element.cornerRadius) {
            this.drawRoundedRect(ctx, x, y, width, height, element.cornerRadius);
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Draw border if specified
        if (element.borderColor) {
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = element.borderWidth || 2;
            
            if (element.cornerRadius) {
                this.drawRoundedRect(ctx, x, y, width, height, element.cornerRadius, true);
            } else {
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
    
    /**
     * Draw a rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     * @param {boolean} stroke - Whether to stroke (true) or fill (false)
     */
    drawRoundedRect(ctx, x, y, width, height, radius, stroke = false) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (stroke) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    }
}