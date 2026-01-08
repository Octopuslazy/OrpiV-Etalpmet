// Endless Runner - Main Game Logic
// Template cho game chạy vô tận

import { Application, Sprite, Graphics, Container } from 'pixi.js';
import { assetManager, arts, sounds } from './assetManager';
import './assetLoader.config'; // Apply project configuration
import { AssetManager } from './managers/AssetManager';

interface GameConfig {
    width: number;
    height: number;
    backgroundColor: number;
    antialias: boolean;
    powerPreference?: 'high-performance' | 'low-power';
}

class Game {
    private app: Application;
    private gameStarted = false;
    private character: any = null;
    private gameContainer: Container;
    private readonly config: GameConfig = {
        width: 720,
        height: 1280,
        backgroundColor: 0x87CEEB,
        antialias: true,
        powerPreference: 'high-performance'
    };

    constructor() {
        this.app = new Application();
        this.gameContainer = new Container();
    }

    async init(): Promise<void> {
        try {
            // Initialize PIXI Application với config tối ưu
            await this.app.init(this.config);

            // Add canvas to DOM
            const appDiv = document.getElementById('app');
            if (!appDiv) {
                throw new Error('App container not found');
            }
            appDiv.appendChild(this.app.canvas);

            // Add main game container
            this.app.stage.addChild(this.gameContainer);

            // Load assets với error handling
            console.log('🎮 Loading assets...');
            await assetManager.loadAssets();
            console.log('✅ Assets loaded successfully!');

            // Setup game
            await this.setupGame();
            
            // Signal ready to ad networks
            this.signalGameReady();
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            throw error;
        }
    }

    private async setupGame(): Promise<void> {
        try {
            // Setup game components
            await this.setupBackground();
            await this.setupPlayer();
            await this.setupObstacles();
            this.startGameLoop();
        } catch (error) {
            console.error('❌ Game setup failed:', error);
            throw error;
        }
    }

    private async setupBackground(): Promise<void> {
        const bg = new Graphics()
            .rect(0, 0, this.config.width, this.config.height)
            .fill(0x87CEEB);
        this.gameContainer.addChild(bg);
    }

    private async setupPlayer(): Promise<void> {
        try {
            const spineAssets = assetManager.getSpineAssets();
            if (spineAssets && spineAssets.texture && spineAssets.jsonData) {
               
            }
        } catch (error) {
            console.warn('⚠️ Spine character fallback:', error);
        }
    }

    private async setupObstacles(): Promise<void> {
         
    }

    private startGameLoop(): void {
        console.log('🔄 Game loop started');
    }

    private signalGameReady() {
        // Signal to ad networks that game is ready
        if (typeof window !== 'undefined') {
            (window as any).gameReady?.();
           
        }
    }

    start() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        
       
    }

    close() {
       
    }
     
}

// Initialize game
const game = new Game();
game.init().catch(console.error);

// Export for ad network callbacks
if (typeof window !== 'undefined') {
    (window as any).gameStart = () => game.start();
    (window as any).gameClose = () => game.close();
}
