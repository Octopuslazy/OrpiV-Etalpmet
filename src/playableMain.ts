import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { sdk } from '@smoud/playable-sdk';
import './unity-mraid.d.ts';

class SimplePlayableGame {
    private app!: Application;
    private mainContainer!: Container;
    
    // Game states
    private isStarted = false;
    private isCompleted = false;
    
    // UI Elements
    private startButton!: Container;
    private endButton!: Container;
    private completeText!: Text;
    private popup!: Container;
    
    // Audio context for Unity compliance
    private audioContext: AudioContext | null = null;
    private hasAudio = false;

    constructor(width: number, height: number) {
        this.init(width, height);
    }

    private async init(width: number, height: number) {
        await this.initPixiApp(width, height);
        this.setupSDKEvents();
        this.createInitialScreen();
    }

    private async initPixiApp(width: number, height: number) {
        // Create PIXI Application
        this.app = new Application();
        await this.app.init({
            width,
            height,
            backgroundColor: 0x0066cc, // Blue background as requested
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Add to DOM
        document.body.appendChild(this.app.canvas);

        // Setup main container
        this.mainContainer = new Container();
        this.app.stage.addChild(this.mainContainer);
    }

    private setupSDKEvents() {
        // Resize handling
        sdk.on('resize', (width: number, height: number) => {
            this.resize(width, height);
        });

        // Unity Ads specific MRAID handling
        if (typeof mraid !== 'undefined') {
            console.log('🔧 Unity MRAID detected, setting up Unity-specific handlers');
            
            // Unity requires explicit MRAID state handling
            const handleMraidReady = () => {
                console.log('📱 MRAID Ready for Unity');
                if (mraid.getState() === 'default') {
                    mraid.addEventListener('stateChange', (state: string) => {
                        console.log('🔄 MRAID State Change:', state);
                        if (state === 'expanded') {
                            // Handle expansion if needed
                        }
                    });
                }
            };

            if (mraid.getState() === 'loading') {
                mraid.addEventListener('ready', handleMraidReady);
            } else {
                handleMraidReady();
            }
        }

        // Other SDK events for playable ads compatibility
        sdk.on('pause', () => console.log('Game paused'));
        sdk.on('resume', () => console.log('Game resumed'));
        sdk.on('volume', (level: number) => console.log(`Volume: ${level}`));
    }

    private createInitialScreen() {
        // Initialize basic audio context for Unity compliance
        this.initAudio();
        
        // Create start button
        this.createStartButton();
        
        // Create complete text (hidden initially)
        this.createCompleteText();
        
        // Create end button (hidden initially) 
        this.createEndButton();
        
        // Create popup (hidden initially)
        this.createPopup();
        
        // Important: Call sdk.start() when ready
        sdk.start();
    }

    private initAudio() {
        try {
            // Create basic audio context for Unity validation
            if (typeof AudioContext !== 'undefined') {
                this.audioContext = new AudioContext();
                this.hasAudio = true;
                console.log('🔊 Audio context initialized for Unity compliance');
                
                // Create silent audio buffer to satisfy audio requirements
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                
                // Play silent audio on first user interaction
                document.addEventListener('click', () => {
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                }, { once: true });
            }
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.hasAudio = false;
        }
    }

    private createStartButton() {
        this.startButton = new Container();
        
        // Button background
        const buttonBg = new Graphics()
            .roundRect(0, 0, 200, 60, 15)
            .fill(0x00ff00); // Green button
        
        // Button text
        const buttonText = new Text({
            text: 'START',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(100, 30);
        
        this.startButton.addChild(buttonBg, buttonText);
        this.startButton.position.set(
            (this.app.screen?.width || 800 - 200) / 2,
            (this.app.screen?.height || 600) / 2 - 30
        );
        
        // Make interactive
        this.startButton.eventMode = 'static';
        this.startButton.cursor = 'pointer';
        this.startButton.on('pointerdown', () => {
            this.handleStart();
        });
        
        this.mainContainer.addChild(this.startButton);
    }

    private createCompleteText() {
        this.completeText = new Text({
            text: 'Process Complete!',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        this.completeText.anchor.set(0.5);
        this.completeText.position.set(
            (this.app.screen?.width || 800) / 2,
            (this.app.screen?.height || 600) / 2 - 50
        );
        this.completeText.visible = false;
        
        this.mainContainer.addChild(this.completeText);
    }

    private createEndButton() {
        this.endButton = new Container();
        
        // Button background  
        const buttonBg = new Graphics()
            .roundRect(0, 0, 180, 50, 10)
            .fill(0xff0000); // Red button
        
        // Button text
        const buttonText = new Text({
            text: 'END',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            })
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(90, 25);
        
        this.endButton.addChild(buttonBg, buttonText);
        this.endButton.position.set(
            (this.app.screen?.width || 800 - 180) / 2,
            (this.app.screen?.height || 600) / 2 + 50
        );
        this.endButton.visible = false;
        
        // Make interactive
        this.endButton.eventMode = 'static';
        this.endButton.cursor = 'pointer';
        this.endButton.on('pointerdown', () => {
            this.handleEnd();
        });
        
        this.mainContainer.addChild(this.endButton);
    }

    private createPopup() {
        this.popup = new Container();
        
        // Semi-transparent background overlay
        const overlay = new Graphics()
            .rect(0, 0, this.app.screen?.width || 800, this.app.screen?.height || 600)
            .fill(0x000000, 0.7);
        
        // Popup background
        const popupBg = new Graphics()
            .roundRect(0, 0, 350, 200, 20)
            .fill(0xffffff);
        popupBg.position.set(
            ((this.app.screen?.width || 800) - 350) / 2,
            ((this.app.screen?.height || 600) - 200) / 2
        );
        
        // Popup text
        const popupText = new Text({
            text: 'Playable Ads Endless',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x000000,
                fontWeight: 'bold',
                align: 'center'
            })
        });
        popupText.anchor.set(0.5);
        popupText.position.set(
            (this.app.screen?.width || 800) / 2,
            (this.app.screen?.height || 600) / 2 - 20
        );
        
        // Close button
        const closeButton = new Container();
        const closeBg = new Graphics()
            .roundRect(0, 0, 100, 40, 10)
            .fill(0x666666);
        const closeText = new Text({
            text: 'Close',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff
            })
        });
        closeText.anchor.set(0.5);
        closeText.position.set(50, 20);
        
        closeButton.addChild(closeBg, closeText);
        closeButton.position.set(
            ((this.app.screen?.width || 800) - 100) / 2,
            (this.app.screen?.height || 600) / 2 + 50
        );
        closeButton.eventMode = 'static';
        closeButton.cursor = 'pointer';
        closeButton.on('pointerdown', () => {
            this.hidePopup();
        });
        
        this.popup.addChild(overlay, popupBg, popupText, closeButton);
        this.popup.visible = false;
        
        this.mainContainer.addChild(this.popup);
    }

    // Main function that's called when START button is pressed
    public start() {
        console.log('🚀 Start function called!');
        this.isStarted = true;
        
        // Hide start button
        this.startButton.visible = false;
        
        // Show "Process Complete" text
        this.completeText.visible = true;
        
        // Show end button
        this.endButton.visible = true;
        
        // Mark as completed
        this.isCompleted = true;
        
        // Trigger SDK finish event for tracking
        sdk.finish();
    }

    private handleStart() {
        console.log('Start button clicked!');
        this.start();
    }

    private handleEnd() {
        console.log('End button clicked!');
        this.showPopup();
        
        // Use proper MRAID open for Unity compliance
        if (typeof mraid !== 'undefined' && mraid.open) {
            // Determine platform and open appropriate store
            const isAndroid = /android/i.test(navigator.userAgent);
            const storeUrl = isAndroid 
                ? (window as any).GOOGLE_PLAY_URL || 'https://play.google.com/store/apps/details?id=com.yourcompany.yourgame'
                : (window as any).APP_STORE_URL || 'https://apps.apple.com/app/id1234567890';
            
            console.log('🏪 Opening store URL via MRAID:', storeUrl);
            mraid.open(storeUrl);
        } else {
            // Fallback to SDK install
            sdk.install();
        }
    }

    private showPopup() {
        this.popup.visible = true;
    }

    private hidePopup() {
        this.popup.visible = false;
    }

    // Responsive design
    private resize(width: number, height: number) {
        this.app.renderer.resize(width, height);
        
        // Reposition elements
        if (this.startButton) {
            this.startButton.position.set((width - 200) / 2, height / 2 - 30);
        }
        
        if (this.completeText) {
            this.completeText.position.set(width / 2, height / 2 - 50);
        }
        
        if (this.endButton) {
            this.endButton.position.set((width - 180) / 2, height / 2 + 50);
        }
        
        if (this.popup) {
            // Update overlay
            const overlay = this.popup.children[0] as Graphics;
            overlay.clear().rect(0, 0, width, height).fill(0x000000, 0.7);
            
            // Update popup position
            const popupBg = this.popup.children[1];
            popupBg.position.set((width - 350) / 2, (height - 200) / 2);
            
            // Update text position
            const popupText = this.popup.children[2] as Text;
            popupText.position.set(width / 2, height / 2 - 20);
            
            // Update close button position
            const closeButton = this.popup.children[3];
            closeButton.position.set((width - 100) / 2, height / 2 + 50);
        }
        
        console.log(`Resized to: ${width}x${height}`);
    }
}

// Initialize the playable when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize SDK with game creation callback
    sdk.init((width: number, height: number) => {
        console.log(`Initializing simple playable with dimensions: ${width}x${height}`);
        new SimplePlayableGame(width, height);
    });
});

export default SimplePlayableGame;