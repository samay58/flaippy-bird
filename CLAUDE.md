# Flaippy Bird - Development Guide

## Build & Run
- Open index.html in a browser to run the game
- No build step required - pure JavaScript

## Code Organization
- JavaScript modules in `/src` folder
- Each game entity has its own class file
- Main game orchestration in `Game.js`

## Code Style Guidelines
- Use ES6 module syntax with named exports
- Class-based OOP architecture
- JSDoc comments for classes and methods
- Descriptive variable names in camelCase
- Constructor pattern for game components
- 4-space indentation

## Game Architecture
- Game loop runs with requestAnimationFrame
- Entity-component pattern for game objects
- Clear separation between rendering and game logic
- Input handling decoupled from game mechanics

## Conventions
- Canvas size scaling based on viewport dimensions
- Constants at top of files or class scope
- Event-based communication between components
- Physics values tuned for smooth gameplay