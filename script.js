document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Get device pixel ratio
    const getDevicePixelRatio = () => {
        return window.devicePixelRatio || 1;
    };
    
    // Set high-DPI canvas
    const setCanvasDimensions = () => {
        // Logical size based on viewport
        const logicalWidth = Math.min(window.innerWidth * 0.8, 480);
        const logicalHeight = Math.min(window.innerHeight * 0.8, 640);
        
        // Store logical size in data attributes
        canvas.setAttribute('data-logical-width', logicalWidth);
        canvas.setAttribute('data-logical-height', logicalHeight);
        
        // Set display size (CSS pixels)
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;
        
        // Get device pixel ratio
        const dpr = getDevicePixelRatio();
        
        // Set actual size in memory (scaled for device pixel ratio)
        canvas.width = Math.floor(logicalWidth * dpr);
        canvas.height = Math.floor(logicalHeight * dpr);
        
        // Scale all drawing operations by the dpr
        ctx.scale(dpr, dpr);
        
        // Ensure text and lines stay crisp after scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    };
    
    // Apply initial canvas setup
    setCanvasDimensions();
    
    // Handle resize events with debouncing for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setCanvasDimensions();
        }, 100);
    });
    
    // Game state
    const game = {
        running: false,
        speed: 3,
        gravity: 0.4,
        score: 0,
        highScore: localStorage.getItem('highScore') || 0,
        difficulty: 1
    };
    
    // Bird object
    const bird = {
        x: 0, // Will be set in reset()
        y: 0, // Will be set in reset()
        radius: 15,
        velocity: 0,
        jumpStrength: -8,
        color: '#FFD166',
        rotation: 0, // Bird rotation in radians
        wingPosition: 0, // For wing animation
        wingDirection: 1, // For wing flapping direction
        wingSpeed: 0.15, // Speed of wing flapping
        targetRotation: 0, // Target rotation for GSAP tweening
        jumpTween: null, // GSAP tween for jump animation
        
        // Reset bird position
        reset(logicalWidth, logicalHeight) {
            // These are critical gameplay properties
            this.x = logicalWidth / 3;
            this.y = logicalHeight / 2;
            this.velocity = 0;
            this.rotation = 0;
            this.targetRotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            
            // Clean up any existing animations
            if (this.jumpTween) this.jumpTween.kill();
            gsap.killTweensOf(this);
            
            // For start menu only, create a hovering animation that doesn't affect physics
            if (!game.running) {
                // Initial entry animation
                gsap.fromTo(this, 
                    { y: logicalHeight + 50 }, 
                    { 
                        y: logicalHeight / 2, 
                        duration: 1, 
                        ease: "elastic.out(1, 0.5)",
                        onComplete: () => {
                            // Only add hover if game is still not running
                            if (!game.running) {
                                // Store the initial position for reference
                                const initialY = this.y;
                                
                                // Gentle hover animation
                                gsap.to(this, {
                                    y: initialY + 8, 
                                    duration: 1.2, 
                                    repeat: -1, 
                                    yoyo: true, 
                                    ease: "sine.inOut",
                                    onUpdate: () => {
                                        // If game starts during animation, kill it
                                        if (game.running) {
                                            gsap.killTweensOf(this, "y");
                                            this.y = initialY; // Reset to initial position
                                        }
                                    }
                                });
                            }
                        } 
                    }
                );
            }
        },
        
        update(logicalHeight) {
            // Apply gravity
            this.velocity += game.gravity;
            this.y += this.velocity;
            
            // Limit falling speed
            if (this.velocity > 12) {
                this.velocity = 12;
            }
            
            // Update rotation based on velocity
            this.targetRotation = Math.max(-0.5, Math.min(Math.PI / 2, this.velocity * 0.08));
            
            // Smooth rotation using GSAP
            if (!this.jumpTween || !this.jumpTween.isActive()) {
                this.rotation = gsap.utils.interpolate(this.rotation, this.targetRotation, 0.1);
            }
            
            // Animate wings
            this.wingPosition += this.wingSpeed * this.wingDirection;
            if (this.wingPosition > 1 || this.wingPosition < -1) {
                this.wingDirection *= -1;
            }
            
            // Check bottom collision
            if (this.y + this.radius > logicalHeight) {
                this.y = logicalHeight - this.radius;
                gameOver();
            }
            
            // Check top collision
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.velocity = 0;
            }
        },
        
        jump() {
            // Set the jump velocity directly - this is crucial for gameplay
            this.velocity = this.jumpStrength;
            
            // Kill any existing hover animations
            gsap.killTweensOf(this, "y");
            
            // Create jump animation with GSAP - but make sure it doesn't interfere with physics
            if (this.jumpTween) this.jumpTween.kill();
            
            // Create a rapid upward rotation (looks like the bird is trying to fly up)
            this.rotation = -0.5;
            
            // Only animate visual properties, not positional ones that affect gameplay
            this.jumpTween = gsap.timeline();
            this.jumpTween.to(this, {
                scaleX: 0.9, 
                scaleY: 1.1, 
                duration: 0.1, 
                ease: "power1.out"
            }).to(this, {
                scaleX: 1, 
                scaleY: 1, 
                duration: 0.2, 
                ease: "elastic.out(1, 0.5)"
            });
            
            // Increase wing flapping speed temporarily
            const originalWingSpeed = this.wingSpeed;
            this.wingSpeed = 0.3;
            setTimeout(() => {
                this.wingSpeed = originalWingSpeed;
            }, 300);
        },
        
        draw() {
            // Save context for rotation
            ctx.save();
            
            // Translate to bird position
            ctx.translate(this.x, this.y);
            
            // Rotate bird based on velocity
            ctx.rotate(this.rotation);
            
            // Scale if needed (for jump effect)
            if (this.scaleX && this.scaleY) {
                ctx.scale(this.scaleX, this.scaleY);
            }
            
            // Draw body (main circle)
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            
            // Draw wings (animate based on wingPosition)
            ctx.beginPath();
            const wingWidth = this.radius * 0.8;
            const wingHeight = this.radius * (0.6 + this.wingPosition * 0.2);
            ctx.ellipse(
                -this.radius/2, 
                0, 
                wingWidth, 
                wingHeight, 
                Math.PI/3, 
                0, 
                Math.PI * 2
            );
            ctx.fillStyle = '#ffc526'; // Slightly darker than body
            ctx.fill();
            ctx.closePath();
            
            // Draw shadow/highlight to give 3D effect
            const gradient = ctx.createRadialGradient(
                this.radius/3, -this.radius/3, 0,
                0, 0, this.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();
            
            // Eye
            ctx.beginPath();
            ctx.arc(this.radius/2, -this.radius/3, this.radius/4, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            ctx.closePath();
            
            // Pupil - add some life with a small white highlight
            ctx.beginPath();
            ctx.arc(this.radius/2 + 1, -this.radius/3 - 1, this.radius/10, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
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
            
            // Restore context after rotation
            ctx.restore();
        }
    };
    
    // Pipes array
    const pipes = [];
    const pipeWidth = 70;
    const pipeGap = 170;
    const pipeColors = ['#EF476F', '#06D6A0', '#118AB2'];
    
    // Add new pipe
    const addPipe = (logicalWidth, logicalHeight) => {
        const gapPosition = Math.random() * (logicalHeight - pipeGap - 120) + 60;
        const colorIndex = Math.floor(Math.random() * pipeColors.length);
        
        pipes.push({
            x: logicalWidth,
            gapTop: gapPosition,
            gapBottom: gapPosition + pipeGap,
            width: pipeWidth,
            color: pipeColors[colorIndex],
            passed: false
        });
    };
    
    // Update pipe positions with enhanced effects
    const updatePipes = (logicalWidth, logicalHeight) => {
        for (let i = pipes.length - 1; i >= 0; i--) {
            // Skip movement if pipe is frozen (after game over)
            if (pipes[i].frozen) continue;
            
            // Move pipe based on game speed
            pipes[i].x -= game.speed;
            
            // Store oscillation data but don't use it for hit detection
            // This ensures visual effects don't interfere with gameplay
            pipes[i].visualOffset = 0;
            if (game.running) {
                pipes[i].oscillationOffset = pipes[i].oscillationOffset || Math.random() * Math.PI * 2;
                pipes[i].visualOffset = Math.sin(Date.now() / 1000 + pipes[i].oscillationOffset) * 0.5;
            }
            
            // Check collisions (without using visual oscillation for hit detection)
            if (checkCollision(bird, pipes[i])) {
                // Create a collision effect
                createCollisionEffect(bird.x, bird.y);
                
                // Game over
                gameOver();
                return;
            }
            
            // Check if bird passed the pipe
            if (!pipes[i].passed && bird.x > pipes[i].x + pipeWidth) {
                pipes[i].passed = true;
                
                // Increment score and update difficulty
                game.score++;
                updateDifficulty();
                
                // Show score popup animation
                createScorePopup(bird.x, bird.y - 30);
            }
            
            // Remove pipes that are off screen
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }
        
        // Add new pipe when needed
        if (pipes.length === 0 || pipes[pipes.length - 1].x < logicalWidth - 250) {
            addPipe(logicalWidth, logicalHeight);
        }
    };
    
    // Create a score popup animation
    const createScorePopup = (x, y) => {
        const popup = {
            x: x,
            y: y,
            opacity: 1,
            scale: 0.8
        };
        
        // Animate the popup
        gsap.to(popup, {
            y: popup.y - 40,
            opacity: 0,
            scale: 1.5,
            duration: 0.8,
            ease: "power1.out",
            onUpdate: () => {
                ctx.save();
                ctx.font = `${Math.floor(30 * popup.scale)}px Arial, sans-serif`;
                ctx.fillStyle = `rgba(255, 255, 255, ${popup.opacity})`;
                ctx.strokeStyle = `rgba(0, 0, 0, ${popup.opacity * 0.5})`;
                ctx.lineWidth = 3;
                ctx.textAlign = 'center';
                ctx.strokeText('+1', popup.x, popup.y);
                ctx.fillText('+1', popup.x, popup.y);
                ctx.restore();
            }
        });
    };
    
    // Create a collision effect
    const createCollisionEffect = (x, y) => {
        // Number of particles
        const particleCount = 15;
        const particles = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 2 + Math.random() * 4;
            const lifetime = 0.5 + Math.random() * 0.5;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: '#FFD166', // Same as bird color
                opacity: 1,
                lifetime: lifetime
            });
        }
        
        // Animate particles
        particles.forEach(particle => {
            gsap.to(particle, {
                x: particle.x + particle.vx * 50,
                y: particle.y + particle.vy * 50,
                size: 0,
                opacity: 0,
                duration: particle.lifetime,
                ease: "power1.out",
                onUpdate: () => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 209, 102, ${particle.opacity})`;
                    ctx.fill();
                    ctx.restore();
                }
            });
        });
        
        // Add an impact flash
        const flash = { opacity: 0.7 };
        gsap.to(flash, {
            opacity: 0,
            duration: 0.3,
            onUpdate: () => {
                const radius = 30;
                ctx.save();
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${flash.opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.restore();
            }
        });
    };
    
    // Draw pipes with enhanced visuals
    const drawPipes = () => {
        // Get logical height for proper drawing
        const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height'));
        
        pipes.forEach(pipe => {
            // Save context for transforms
            ctx.save();
            
            // Use visualOffset for drawing only (doesn't affect gameplay/hitboxes)
            const visualOffset = pipe.visualOffset || 0;
            
            // Top pipe
            ctx.fillStyle = pipe.color;
            
            // Create a rounded pipe cap for the top pipe
            const cornerRadius = 6;
            
            // Top pipe with rounded bottom - use visualOffset only for display
            drawRoundedRect(
                pipe.x, 
                0,
                pipe.width,
                pipe.gapTop + visualOffset,  // Visual effect only
                { bottomLeft: cornerRadius, bottomRight: cornerRadius }
            );
            
            // Bottom pipe with rounded top - use visualOffset only for display
            drawRoundedRect(
                pipe.x,
                pipe.gapBottom + visualOffset,  // Visual effect only
                pipe.width,
                logicalHeight - (pipe.gapBottom + visualOffset),
                { topLeft: cornerRadius, topRight: cornerRadius }
            );
            
            // Add gradient for 3D effect
            const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            
            // Top pipe gradient overlay
            ctx.fillStyle = gradient;
            drawRoundedRect(
                pipe.x, 
                0,
                pipe.width,
                pipe.gapTop,
                { bottomLeft: cornerRadius, bottomRight: cornerRadius }
            );
            
            // Bottom pipe gradient overlay
            drawRoundedRect(
                pipe.x,
                pipe.gapBottom,
                pipe.width,
                logicalHeight - pipe.gapBottom,
                { topLeft: cornerRadius, topRight: cornerRadius }
            );
            
            // Add decorative elements to pipes
            // Top pipe decorative band
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(pipe.x, pipe.gapTop - 15, pipe.width, 8);
            
            // Bottom pipe decorative band
            ctx.fillRect(pipe.x, pipe.gapBottom + 7, pipe.width, 8);
            
            // Add subtle shadow at the inside edge of pipe openings
            const innerShadowHeight = 5;
            const innerGradient = ctx.createLinearGradient(0, pipe.gapTop - innerShadowHeight, 0, pipe.gapTop);
            innerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            
            // Bottom shadow for top pipe
            ctx.fillStyle = innerGradient;
            ctx.fillRect(pipe.x, pipe.gapTop - innerShadowHeight, pipe.width, innerShadowHeight);
            
            // Top shadow for bottom pipe
            const bottomInnerGradient = ctx.createLinearGradient(0, pipe.gapBottom, 0, pipe.gapBottom + innerShadowHeight);
            bottomInnerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            bottomInnerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bottomInnerGradient;
            ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, innerShadowHeight);
            
            // Restore context
            ctx.restore();
        });
    };
    
    // Helper function to draw rounded rectangles
    const drawRoundedRect = (x, y, width, height, corners = {}) => {
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
    };
    
    // Check collision between bird and pipe
    const checkCollision = (bird, pipe) => {
        // Simplified collision detection with slightly more forgiving hit box (5% smaller)
        const effectiveRadius = bird.radius * 0.95;
        
        if (bird.x + effectiveRadius > pipe.x && bird.x - effectiveRadius < pipe.x + pipe.width) {
            if (bird.y - effectiveRadius < pipe.gapTop || bird.y + effectiveRadius > pipe.gapBottom) {
                return true;
            }
        }
        return false;
    };
    
    // Update difficulty as score increases
    const updateDifficulty = () => {
        if (game.score % 5 === 0) {
            game.difficulty += 0.1;
            game.speed = 3 + game.difficulty;
        }
    };
    
    // Draw score
    const drawScore = (logicalWidth) => {
        // Score backdrop - subtle glow
        ctx.save();
        ctx.textAlign = 'center';
        
        // Current score
        ctx.font = 'bold 40px Arial, sans-serif';
        
        // Text shadow for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(game.score, logicalWidth / 2 + 2, 62);
        
        // Main text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(game.score, logicalWidth / 2, 60);
        
        // High score with smaller text
        ctx.font = '20px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`High Score: ${game.highScore}`, logicalWidth / 2, 90);
        
        ctx.restore();
    };
    
    // Game over with enhanced animations
    const gameOver = () => {
        game.running = false;
        
        // Update high score with animation if new high score
        const isNewHighScore = game.score > game.highScore;
        if (isNewHighScore) {
            // Animate counting up to new high score
            const oldHighScore = game.highScore;
            game.highScore = game.score;
            localStorage.setItem('highScore', game.highScore);
            
            // Will animate the high score counter later
            game.displayHighScore = oldHighScore;
        } else {
            game.displayHighScore = game.highScore;
        }
        
        // Get logical dimensions
        const logicalWidth = parseFloat(canvas.getAttribute('data-logical-width'));
        const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height'));
        
        // Kill any existing bird animations and add death animation
        gsap.killTweensOf(bird);
        
        // Bird death animation - spin and fall
        gsap.to(bird, {
            rotation: Math.PI * 4, // Spin around twice
            y: logicalHeight + 50, // Fall below screen
            duration: 1.5,
            ease: "power2.in"
        });
        
        // Freeze the pipes
        pipes.forEach(pipe => {
            pipe.frozen = true;
        });
        
        // Show game over screen with GSAP animations
        const showGameOver = () => {
            // Create overlay using GSAP
            const overlay = { opacity: 0 };
            
            gsap.to(overlay, {
                opacity: 0.7,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                    // Background overlay
                    ctx.fillStyle = `rgba(0, 0, 0, ${overlay.opacity})`;
                    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
                }
            });
            
            // Animate game over text flying in from top
            const gameOverText = { y: -50, opacity: 0 };
            
            gsap.to(gameOverText, {
                y: logicalHeight / 2 - 50,
                opacity: 1,
                duration: 0.8,
                delay: 0.3,
                ease: "back.out(1.7)",
                onUpdate: () => {
                    ctx.save();
                    ctx.font = 'bold 50px Arial, sans-serif';
                    ctx.fillStyle = `rgba(255, 255, 255, ${gameOverText.opacity})`;
                    ctx.textAlign = 'center';
                    ctx.fillText('Game Over', logicalWidth / 2, gameOverText.y);
                    ctx.restore();
                }
            });
            
            // Score text fade in
            const scoreText = { opacity: 0 };
            
            gsap.to(scoreText, {
                opacity: 1,
                duration: 0.5,
                delay: 0.8,
                onUpdate: () => {
                    ctx.save();
                    ctx.font = '25px Arial, sans-serif';
                    ctx.fillStyle = `rgba(255, 255, 255, ${scoreText.opacity})`;
                    ctx.textAlign = 'center';
                    ctx.fillText(`Score: ${game.score}`, logicalWidth / 2, logicalHeight / 2);
                    ctx.restore();
                }
            });
            
            // High score with counter animation if new high score
            if (isNewHighScore) {
                gsap.to(game, {
                    displayHighScore: game.highScore,
                    duration: 1.5,
                    delay: 1,
                    ease: "power1.out",
                    onUpdate: () => {
                        ctx.save();
                        ctx.font = '25px Arial, sans-serif';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.textAlign = 'center';
                        
                        // Display with numeric counter
                        const displayScore = Math.floor(game.displayHighScore);
                        
                        // Add a highlight for new high score
                        ctx.fillStyle = '#FFD700'; // Gold color
                        ctx.fillText(`New High Score: ${displayScore}!`, logicalWidth / 2, logicalHeight / 2 + 40);
                        ctx.restore();
                    }
                });
            } else {
                // Regular high score display
                const highScoreText = { opacity: 0 };
                
                gsap.to(highScoreText, {
                    opacity: 1,
                    duration: 0.5,
                    delay: 1,
                    onUpdate: () => {
                        ctx.save();
                        ctx.font = '25px Arial, sans-serif';
                        ctx.fillStyle = `rgba(255, 255, 255, ${highScoreText.opacity})`;
                        ctx.textAlign = 'center';
                        ctx.fillText(`High Score: ${game.highScore}`, logicalWidth / 2, logicalHeight / 2 + 40);
                        ctx.restore();
                    }
                });
            }
            
            // Restart instruction text with pulsing effect
            const restartText = { opacity: 0, pulse: 0 };
            
            gsap.to(restartText, {
                opacity: 1,
                duration: 0.5,
                delay: 1.3,
                onComplete: () => {
                    // Add pulsing effect after fade in
                    gsap.to(restartText, {
                        pulse: 1,
                        duration: 1,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                },
                onUpdate: () => {
                    ctx.save();
                    // Calculate pulsing opacity between 0.7 and 1
                    const pulseOpacity = 0.7 + (restartText.pulse * 0.3);
                    
                    ctx.font = '25px Arial, sans-serif';
                    ctx.fillStyle = `rgba(255, 255, 255, ${restartText.opacity * pulseOpacity})`;
                    ctx.textAlign = 'center';
                    ctx.fillText('Press Space to restart', logicalWidth / 2, logicalHeight / 2 + 90);
                    ctx.restore();
                }
            });
        };
        
        // Start the game over sequence
        setTimeout(showGameOver, 300); // Small delay for dramatic effect
    };
    
    // Draw background with enhanced parallax effect
    const drawBackground = (logicalWidth, logicalHeight) => {
        const now = Date.now();
        
        // Multi-layer gradient sky for depth
        const skyGradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
        skyGradient.addColorStop(0, '#0f1028'); // Darker at top
        skyGradient.addColorStop(0.3, '#1A1A2E');
        skyGradient.addColorStop(0.7, '#16213E');
        skyGradient.addColorStop(1, '#1e3163'); // Slightly lighter at bottom
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        
        // Create a nebula/galaxy effect
        const nebulaGradient = ctx.createRadialGradient(
            logicalWidth * 0.8, 
            logicalHeight * 0.2, 
            0,
            logicalWidth * 0.8, 
            logicalHeight * 0.2, 
            logicalWidth * 0.5
        );
        nebulaGradient.addColorStop(0, 'rgba(106, 76, 147, 0.1)'); // Purple
        nebulaGradient.addColorStop(0.5, 'rgba(106, 76, 147, 0.05)');
        nebulaGradient.addColorStop(1, 'rgba(106, 76, 147, 0)');
        
        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        
        // Second nebula for more depth
        const nebulaGradient2 = ctx.createRadialGradient(
            logicalWidth * 0.2, 
            logicalHeight * 0.7, 
            0,
            logicalWidth * 0.2, 
            logicalHeight * 0.7, 
            logicalWidth * 0.4
        );
        nebulaGradient2.addColorStop(0, 'rgba(59, 82, 128, 0.1)'); // Blue
        nebulaGradient2.addColorStop(0.5, 'rgba(59, 82, 128, 0.05)');
        nebulaGradient2.addColorStop(1, 'rgba(59, 82, 128, 0)');
        
        ctx.fillStyle = nebulaGradient2;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        
        // Far distant stars (small, many, dim)
        for (let i = 0; i < 100; i++) {
            const x = ((i * 17) + (now / 30000 * logicalWidth)) % logicalWidth;
            const y = ((i * 23) % logicalHeight);
            const size = 1;
            const alpha = 0.1 + (Math.sin(now / 3000 + i) + 1) / 20; // Very subtle pulsing
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Mid-distance stars (medium, pulsing)
        for (let i = 0; i < 40; i++) {
            const x = ((i * 43) + (now / 20000 * logicalWidth)) % logicalWidth;
            const y = ((i * 37) % logicalHeight);
            const size = ((i % 3) + 1) * 1.2;
            const alpha = 0.3 + (Math.sin(now / 1000 + i) + 1) / 4; // Pulsing effect
            
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
            ctx.closePath();
            
            // Add occasional star glints
            if (i % 5 === 0) {
                const glintSize = size * 3;
                const glintAlpha = 0.05 + (Math.sin(now / 500 + i) + 1) / 15;
                
                // Cross glint
                ctx.beginPath();
                ctx.moveTo(x - glintSize, y);
                ctx.lineTo(x + glintSize, y);
                ctx.moveTo(x, y - glintSize);
                ctx.lineTo(x, y + glintSize);
                ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.closePath();
            }
        }
        
        // Closer stars (larger, animated)
        for (let i = 0; i < 15; i++) {
            const speed = (i % 3 + 1) * 0.4;
            const x = (now / (1000 / speed) + i * 200) % logicalWidth;
            const y = (i * logicalHeight / 15 + (now / 8000 * logicalHeight / 5)) % logicalHeight;
            const size = (i % 3) + 2;
            
            // Star with gentle glow
            ctx.save();
            for (let j = 0; j < 3; j++) {
                const glowSize = size * (j + 1) * 0.7;
                const alpha = 0.2 / (j + 1);
                
                ctx.beginPath();
                ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
                ctx.closePath();
            }
            
            // Star center
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        
        // Add subtle horizontal gradient overlay for atmosphere
        const atmosphereGradient = ctx.createLinearGradient(0, 0, logicalWidth, 0);
        atmosphereGradient.addColorStop(0, 'rgba(0, 20, 40, 0.1)');
        atmosphereGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        atmosphereGradient.addColorStop(1, 'rgba(20, 0, 40, 0.1)');
        
        ctx.fillStyle = atmosphereGradient;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    };
    
    // Game loop
    const gameLoop = () => {
        try {
            // Get logical dimensions for drawing operations
            const logicalWidth = parseFloat(canvas.getAttribute('data-logical-width') || canvas.width);
            const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height') || canvas.height);
            
            // Clear canvas (using logical dimensions)
            ctx.clearRect(0, 0, logicalWidth, logicalHeight);
            
            // Draw background
            drawBackground(logicalWidth, logicalHeight);
            
            if (game.running) {
                // Core gameplay update
                const hitGround = bird.update(logicalHeight);
                if (hitGround) {
                    gameOver();
                } else {
                    updatePipes(logicalWidth, logicalHeight);
                }
                
                // Draw game objects
                drawPipes();
                bird.draw();
                drawScore(logicalWidth);
            } else {
                // Draw title screen if not started
                if (game.score === 0) {
                    ctx.font = 'bold 40px Arial, sans-serif';
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.fillText('Flaippy Bird', logicalWidth / 2, logicalHeight / 2 - 50);
                    
                    ctx.font = '25px Arial, sans-serif';
                    ctx.fillText('Press Space to start', logicalWidth / 2, logicalHeight / 2 + 20);
                    
                    // Draw bird on title screen
                    bird.draw();
                }
            }
        } catch (e) {
            console.error("Game loop error:", e);
        }
        
        requestAnimationFrame(gameLoop);
    };
    
    // Start game with smooth animations but maintain proper gameplay mechanics
    const startGame = () => {
        // Get logical dimensions
        const logicalWidth = parseFloat(canvas.getAttribute('data-logical-width'));
        const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height'));
        
        // Kill any existing animations that could interfere with gameplay
        gsap.killTweensOf(game);
        gsap.killTweensOf(bird, "y"); // Especially kill y animations that affect position
        
        // Set immediate gameplay properties to ensure responsive controls
        game.running = true;
        game.score = 0;
        
        // Set initial physics properties directly
        game.difficulty = 1;
        game.speed = 3;
        game.gravity = 0.4;
        
        // Reset bird position immediately to ensure proper physics
        bird.reset(logicalWidth, logicalHeight);
        
        // Clear pipes
        pipes.length = 0;
        
        // Simple visual transition effect that doesn't interfere with gameplay
        const flashScreen = () => {
            // Create a fading overlay without affecting gameplay mechanics
            const overlay = { opacity: 0.3 };
            
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.5,
                onUpdate: function() {
                    // Only draw the overlay, don't modify game state
                    ctx.save();
                    ctx.fillStyle = `rgba(255, 255, 255, ${overlay.opacity})`;
                    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
                    ctx.restore();
                }
            });
        };
        
        // Add subtle visual flash without affecting gameplay
        flashScreen();
    };
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling with spacebar
            
            if (!game.running) {
                startGame();
            } else {
                bird.jump();
            }
        }
    });
    
    // Touch controls for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (!game.running) {
            startGame();
        } else {
            bird.jump();
        }
    });
    
    // Start game loop
    gameLoop();
});