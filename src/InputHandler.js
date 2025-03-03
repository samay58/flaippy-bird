/**
 * InputHandler class - Manages keyboard and touch inputs
 */
export default class InputHandler {
    /**
     * Create a new InputHandler instance
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Function} onJump - Callback function for jump action
     * @param {Function} onStart - Callback function for game start
     * @param {Function} onPause - Callback function for pause toggle
     */
    constructor(canvas, onJump, onStart, onPause) {
        this.onJump = onJump;
        this.onStart = onStart;
        this.onPause = onPause || (() => {});
        this.isGameRunning = false;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.swipeThreshold = 50; // Minimum distance for a swipe
        this.swipeTimeThreshold = 300; // Maximum time for a swipe in ms
        
        // Set up keyboard event listeners
        this.setupKeyboardControls();
        
        // Set up touch event listeners
        if (canvas) {
            this.setupTouchControls(canvas);
        }
    }

    /**
     * Set up keyboard controls
     */
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            // Prevent default behavior for game controls
            if (['Space', 'ArrowUp', 'KeyP', 'Escape'].includes(e.code)) {
                e.preventDefault();
            }
            
            // Handle different key inputs
            switch (e.code) {
                case 'Space':
                case 'ArrowUp':
                    if (!this.isGameRunning) {
                        this.onStart();
                        this.isGameRunning = true;
                    } else {
                        this.onJump();
                    }
                    break;
                    
                case 'KeyP':
                case 'Escape':
                    if (this.isGameRunning) {
                        this.onPause();
                    }
                    break;
            }
        });
    }

    /**
     * Set up touch controls with swipe detection
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    setupTouchControls(canvas) {
        // Enhanced touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let lastTap = 0;
        const DOUBLE_TAP_DELAY = 300; // ms
        const SWIPE_THRESHOLD = 50; // px
        
        // Touch start event with better responsiveness
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Store touch data for gesture detection
            const touch = e.touches[0];
            this.touchStartY = touch.clientY;
            this.touchStartX = touch.clientX;
            this.touchStartTime = Date.now();
            
            // Add haptic feedback and sound if supported
            if (window.soundManager) {
                // Add haptic feedback
                window.soundManager.vibrate(10); // Subtle vibration
                
                // Play sound when jump is triggered
                if (window.soundManager.initialized) {
                    window.soundManager.play('jump');
                }
            }
            
            if (!this.isGameRunning) {
                this.onStart();
                this.isGameRunning = true;
            } else {
                this.onJump();
            }
        }, { passive: false });
        
        // Touch end event for gesture detection
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Skip if we didn't record start position
            if (!this.touchStartY) return;
            
            const touchEndTime = Date.now();
            const elapsedTime = touchEndTime - this.touchStartTime;
            const touch = e.changedTouches[0];
            
            // Detect swipes
            if (elapsedTime <= this.swipeTimeThreshold) {
                const swipeDistanceY = touch.clientY - this.touchStartY;
                const swipeDistanceX = touch.clientX - this.touchStartX;
                
                // Detect downward swipe for pause
                if (swipeDistanceY > this.swipeThreshold && 
                    Math.abs(swipeDistanceX) < this.swipeThreshold && 
                    this.isGameRunning) {
                    this.onPause();
                    // Add haptic feedback and sound if supported
                    if (window.soundManager) {
                        window.soundManager.vibrate(20);
                        
                        // Play pause sound
                        if (window.soundManager.initialized) {
                            window.soundManager.play('button');
                        }
                    }
                }
            }
            
            // Detect double tap for pause
            const tapLength = touchEndTime - lastTap;
            if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0 && this.isGameRunning) {
                this.onPause();
                // Add stronger haptic feedback and sound for pause
                if (window.soundManager) {
                    window.soundManager.vibrate([20, 30, 20]);
                    
                    // Play pause sound
                    if (window.soundManager.initialized) {
                        window.soundManager.play('button');
                    }
                }
            }
            lastTap = touchEndTime;
            
            // Reset touch tracking
            this.touchStartY = 0;
            this.touchStartX = 0;
            this.touchStartTime = 0;
        }, { passive: false });
        
        // Touch move handler to prevent page scrolling during game
        canvas.addEventListener('touchmove', (e) => {
            // Prevent default to stop page scrolling during gameplay
            if (this.isGameRunning) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Update game running state
     * @param {boolean} isRunning - Whether the game is running
     */
    setGameRunning(isRunning) {
        this.isGameRunning = isRunning;
    }
}