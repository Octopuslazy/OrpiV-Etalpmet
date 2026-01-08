import { Application, Container, Graphics, Text, TextStyle, Sprite } from 'pixi.js';
import { sdk } from '@smoud/playable-sdk';
import { loadGameAssets, loadTexture } from './assetLoader';

class PlayableGame {
    private app!: Application;
    private gameContainer!: Container;
    private uiContainer!: Container;
    private isGameStarted = false;
    private isGameFinished = false;
    
    // UI Elements
    private startButton!: Sprite;
    private ctaButton!: Sprite;
    private muteButton!: Sprite;
    private loadingScreen!: Container;
    private endScreen!: Container;
    private gameplayScene!: Container;
    
    // Game state
    private currentVolume = 1;
    private isPaused = false;

    constructor(width: number, height: number) {
        this.initPixiApp(width, height);
        this.setupSDKEvents();
        this.createLoadingScreen();
        this.loadAssets();
    }

    private async initPixiApp(width: number, height: number) {
        // Create PIXI Application
        this.app = new Application();
        await this.app.init({
            width,
            height,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Add to DOM
        document.body.appendChild(this.app.canvas);

        // Setup containers
        this.gameContainer = new Container();
        this.uiContainer = new Container();
        this.app.stage.addChild(this.gameContainer);
        this.app.stage.addChild(this.uiContainer);
    }

    private setupSDKEvents() {
        // Resize handling for responsive design
        sdk.on('resize', (width: number, height: number) => {
            console.log(`Resizing to: ${width}x${height}`);
            this.resize(width, height);
        });

        // Pause/Resume handling
        sdk.on('pause', () => {
            console.log('Game paused');
            this.pauseGame();
        });

        sdk.on('resume', () => {
            console.log('Game resumed');
            this.resumeGame();
        });

        // Volume control
        sdk.on('volume', (level: number) => {
            console.log(`Volume changed to: ${level}`);
            this.setVolume(level);
            this.updateMuteButtonState();
        });

        // Interaction tracking
        sdk.on('interaction', (count: number) => {
            console.log(`User interaction count: ${count}`);
            
            // Show CTA after sufficient engagement (3+ interactions)
            if (count >= 3 && !this.isGameFinished) {
                this.showCTAButton();
            }

            // Auto-complete after many interactions
            if (count >= 5 && !this.isGameFinished) {
                this.finishGame();
            }
        });

        // Game finish
        sdk.on('finish', () => {
            console.log('Game finished');
            this.showEndScreen();
        });

        // Install tracking
        sdk.on('install', () => {
            console.log('Install button clicked - redirecting to store');
        });

        // Retry functionality
        sdk.on('retry', () => {
            console.log('Game retry triggered');
            this.restartGame();
        });

        // Optional: Track game lifecycle
        sdk.on('init', () => console.log('SDK initialized'));
        sdk.on('boot', () => console.log('SDK booted'));
        sdk.on('ready', () => console.log('SDK ready'));
        sdk.on('start', () => {
            console.log('Playable started');
            this.startGameplay();
        });
    }

    private createLoadingScreen() {
        this.loadingScreen = new Container();
        
        // Background
        const bg = new Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill(0x000000);
        
        // Loading text
        const loadingText = new Text({
            text: 'Loading...',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff,
            })
        });
        loadingText.anchor.set(0.5);
        loadingText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.loadingScreen.addChild(bg, loadingText);
        this.uiContainer.addChild(this.loadingScreen);
    }

    private async loadAssets() {
        try {
            console.log('Loading game assets...');
            await loadGameAssets();
            console.log('Assets loaded successfully');
            
            this.createGameplayScene();
            this.createUI();
            this.hideLoadingScreen();
            
            // Important: Call sdk.start() when all resources are loaded
            sdk.start();
        } catch (error) {
            console.error('Failed to load assets:', error);
            // Handle gracefully - create basic UI even if assets fail
            this.createBasicUI();
            this.hideLoadingScreen();
            sdk.start();
        }
    }

    private createGameplayScene() {
        this.gameplayScene = new Container();
        
        // Example gameplay elements
        const gameTitle = new Text({
            text: 'Awesome Game!',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 4 }
            })
        });
        gameTitle.anchor.set(0.5);
        gameTitle.position.set(this.app.screen.width / 2, 100);

        // Example game object
        const gameObject = new Graphics()
            .circle(0, 0, 50)
            .fill(0xff0000);
        gameObject.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        
        // Make it interactive
        gameObject.eventMode = 'static';
        gameObject.cursor = 'pointer';
        gameObject.on('pointerdown', () => {
            // This will be tracked by SDK automatically
            console.log('Game object clicked!');
            this.animateGameObject(gameObject);
        });

        this.gameplayScene.addChild(gameTitle, gameObject);
        this.gameContainer.addChild(this.gameplayScene);
    }

    private createUI() {
        // Start Button
        this.createStartButton();
        
        // CTA Button (hidden initially)
        this.createCTAButton();
        
        // Mute Button
        this.createMuteButton();
        
        // End Screen (hidden initially)
        this.createEndScreen();
    }

    private createStartButton() {
        const buttonBg = new Graphics()
            .roundRect(0, 0, 200, 60, 15)
            .fill(0x00ff00);

        const buttonText = new Text({
            text: 'START GAME',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(100, 30);

        this.startButton = new Sprite();
        this.startButton.addChild(buttonBg, buttonText);
        this.startButton.position.set(
            (this.app.screen.width - 200) / 2,
            this.app.screen.height - 120
        );
        
        this.startButton.eventMode = 'static';
        this.startButton.cursor = 'pointer';
        this.startButton.on('pointerdown', () => {
            this.hideStartButton();
            this.startGameplay();
        });

        this.uiContainer.addChild(this.startButton);
    }

    private createCTAButton() {
        const buttonBg = new Graphics()
            .roundRect(0, 0, 180, 50, 10)
            .fill(0xff6600);

        const buttonText = new Text({
            text: 'DOWNLOAD',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(90, 25);

        this.ctaButton = new Sprite();
        this.ctaButton.addChild(buttonBg, buttonText);
        this.ctaButton.position.set(20, 20);
        this.ctaButton.visible = false;
        
        this.ctaButton.eventMode = 'static';
        this.ctaButton.cursor = 'pointer';
        this.ctaButton.on('pointerdown', () => {
            // Trigger install - SDK will handle store redirect
            sdk.install();
        });

        this.uiContainer.addChild(this.ctaButton);
    }

    private createMuteButton() {
        const buttonBg = new Graphics()
            .circle(0, 0, 25)
            .fill(0x333333);

        const buttonText = new Text({
            text: '🔊',
            style: new TextStyle({ fontSize: 20 })
        });
        buttonText.anchor.set(0.5);

        this.muteButton = new Sprite();
        this.muteButton.addChild(buttonBg, buttonText);
        this.muteButton.position.set(this.app.screen.width - 60, 40);
        
        this.muteButton.eventMode = 'static';
        this.muteButton.cursor = 'pointer';
        this.muteButton.on('pointerdown', () => {
            this.toggleMute();
        });

        this.uiContainer.addChild(this.muteButton);
    }

    private createEndScreen() {
        this.endScreen = new Container();
        
        // Background
        const bg = new Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill(0x000000, 0.8);

        // End text
        const endText = new Text({
            text: 'Great Job!\nDownload to continue',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 0xffffff,
                align: 'center'
            })
        });
        endText.anchor.set(0.5);
        endText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 50);

        // Download button
        const downloadBg = new Graphics()
            .roundRect(0, 0, 250, 70, 20)
            .fill(0xff0066);

        const downloadText = new Text({
            text: 'DOWNLOAD NOW',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        downloadText.anchor.set(0.5);
        downloadText.position.set(125, 35);

        const downloadButton = new Sprite();
        downloadButton.addChild(downloadBg, downloadText);
        downloadButton.position.set(
            (this.app.screen.width - 250) / 2,
            this.app.screen.height / 2 + 50
        );
        downloadButton.eventMode = 'static';
        downloadButton.cursor = 'pointer';
        downloadButton.on('pointerdown', () => {
            sdk.install();
        });

        this.endScreen.addChild(bg, endText, downloadButton);
        this.endScreen.visible = false;
        this.uiContainer.addChild(this.endScreen);
    }

    private createBasicUI() {
        console.log('Creating basic UI fallback');
        this.createStartButton();
        this.createCTAButton();
        this.createMuteButton();
        this.createEndScreen();
    }

    // Game control methods
    private startGameplay() {
        if (this.isGameStarted) return;
        
        console.log('Starting gameplay');
        this.isGameStarted = true;
        this.hideStartButton();
        
        // Example: Start game animations/logic here
        this.animateGameScene();
    }

    private finishGame() {
        if (this.isGameFinished) return;
        
        console.log('Finishing game');
        this.isGameFinished = true;
        
        // Mark playable as complete - this triggers the 'finish' event
        sdk.finish();
    }

    private restartGame() {
        console.log('Restarting game');
        this.isGameStarted = false;
        this.isGameFinished = false;
        this.hideEndScreen();
        this.hideCTAButton();
        this.showStartButton();
    }

    // Animation and interaction methods
    private animateGameObject(obj: Graphics) {
        // Simple scale animation
        const originalScale = obj.scale.x;
        obj.scale.set(originalScale * 1.2);
        
        setTimeout(() => {
            obj.scale.set(originalScale);
        }, 150);
    }

    private animateGameScene() {
        // Add your game animations here
        console.log('Game scene animated');
    }

    // Audio control
    private setVolume(level: number) {
        this.currentVolume = level;
        // Implement your audio volume control here
        // Example: Howler.volume(level) or your audio system
        console.log(`Volume set to: ${level}`);
    }

    private toggleMute() {
        const newVolume = this.currentVolume > 0 ? 0 : 1;
        this.setVolume(newVolume);
        this.updateMuteButtonState();
        
        // SDK will handle the volume change event
        sdk.volume = newVolume;
    }

    private updateMuteButtonState() {
        const muteText = this.muteButton.children[1] as Text;
        muteText.text = this.currentVolume > 0 ? '🔊' : '🔇';
    }

    // Pause/Resume control
    private pauseGame() {
        this.isPaused = true;
        // Pause your game logic, animations, audio here
        console.log('Game paused');
    }

    private resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        // Resume your game logic, animations, audio here
        console.log('Game resumed');
    }

    // Responsive design
    private resize(width: number, height: number) {
        // Resize PIXI application
        this.app.renderer.resize(width, height);
        
        // Reposition UI elements
        this.repositionUI(width, height);
        
        console.log(`Resized to: ${width}x${height}, Landscape: ${sdk.isLandscape}`);
    }

    private repositionUI(width: number, height: number) {
        if (this.loadingScreen) {
            const bg = this.loadingScreen.children[0] as Graphics;
            bg.clear().rect(0, 0, width, height).fill(0x000000);
            
            const text = this.loadingScreen.children[1] as Text;
            text.position.set(width / 2, height / 2);
        }

        if (this.startButton) {
            this.startButton.position.set((width - 200) / 2, height - 120);
        }

        if (this.muteButton) {
            this.muteButton.position.set(width - 60, 40);
        }

        if (this.endScreen) {
            const bg = this.endScreen.children[0] as Graphics;
            bg.clear().rect(0, 0, width, height).fill(0x000000, 0.8);
            
            const text = this.endScreen.children[1] as Text;
            text.position.set(width / 2, height / 2 - 50);
            
            const button = this.endScreen.children[2] as Sprite;
            button.position.set((width - 250) / 2, height / 2 + 50);
        }

        // Reposition gameplay scene elements if needed
        if (this.gameplayScene) {
            const title = this.gameplayScene.children[0] as Text;
            title.position.set(width / 2, 100);
            
            const gameObject = this.gameplayScene.children[1] as Graphics;
            gameObject.position.set(width / 2, height / 2);
        }
    }

    // UI visibility controls
    private hideLoadingScreen() {
        if (this.loadingScreen) this.loadingScreen.visible = false;
    }

    private showStartButton() {
        if (this.startButton) this.startButton.visible = true;
    }

    private hideStartButton() {
        if (this.startButton) this.startButton.visible = false;
    }

    private showCTAButton() {
        if (this.ctaButton) this.ctaButton.visible = true;
    }

    private hideCTAButton() {
        if (this.ctaButton) this.ctaButton.visible = false;
    }

    private showEndScreen() {
        if (this.endScreen) this.endScreen.visible = true;
    }

    private hideEndScreen() {
        if (this.endScreen) this.endScreen.visible = false;
    }
}

// Initialize the playable when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize SDK with game creation callback
    sdk.init((width: number, height: number) => {
        console.log(`Initializing playable with dimensions: ${width}x${height}`);
        new PlayableGame(width, height);
    });
});

export default PlayableGame;