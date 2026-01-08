// Optimized Asset Manager - Thay thế cho assetLoader.ts phức tạp
import { Assets, Texture } from 'pixi.js';
import * as spinePixi from '@esotericsoftware/spine-pixi-v8';

interface AssetConfig {
    spine?: {
        enabled: boolean;
        baseName: string;
        basePath: string;
        textureAlias?: string;
    };
    folders: {
        arts: string;
        sounds: string;
    };
    fileExtensions: {
        images: string[];
        sounds: string[];
    };
}

// Default configuration
const DEFAULT_CONFIG: AssetConfig = {
    spine: {
        enabled: false,
        baseName: 'character',
        basePath: '../Assets/Characters',
        textureAlias: 'character_tex'
    },
    folders: {
        arts: '../Assets/Images',
        sounds: '../Assets/Sounds'
    },
    fileExtensions: {
        images: ['.png', '.jpg', '.webp'],
        sounds: ['.mp3', '.ogg', '.wav']
    }
};

class AssetManager {
    private config: AssetConfig = DEFAULT_CONFIG;
    public loadedAssets = new Map<string, any>();
    private spineCache: any = null;

    configure(newConfig: Partial<AssetConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    async loadAssets(): Promise<{ images: Record<string, any>; sounds: Record<string, any> }> {
        const [images, sounds] = await Promise.all([
            this.loadImages(),
            this.loadSounds()
        ]);

        // Load spine if enabled
        if (this.config.spine?.enabled) {
            await this.loadSpineAssets();
        }

        return { images, sounds };
    }

    private async loadImages(): Promise<Record<string, any>> {
        try {
            const context = this.getRequireContext(
                this.config.folders.arts,
                this.config.fileExtensions.images
            );
            return this.importAll(context);
        } catch (error) {
            console.warn('Failed to load images:', error);
            return {};
        }
    }

    private async loadSounds(): Promise<Record<string, any>> {
        try {
            const context = this.getRequireContext(
                this.config.folders.sounds,
                this.config.fileExtensions.sounds
            );
            return this.importAll(context);
        } catch (error) {
            console.warn('Failed to load sounds:', error);
            return {};
        }
    }

    private async loadSpineAssets(): Promise<void> {
        if (!this.config.spine?.enabled || this.spineCache) return;

        try {
            const { baseName, basePath } = this.config.spine;
            
            const [pngModule, atlasModule, jsonModule] = await Promise.all([
                import(`${basePath}/${baseName}.png`),
                import(`${basePath}/${baseName}.atlas`),
                import(`${basePath}/${baseName}.json`)
            ]);

            this.spineCache = {
                png: pngModule.default || pngModule,
                atlas: atlasModule.default || atlasModule,
                json: jsonModule.default || jsonModule
            };

            // Register with PIXI Assets
            const alias = this.config.spine.textureAlias || 'spine_tex';
            Assets.add({ alias, src: this.spineCache.png });
            await Assets.load(alias);

        } catch (error) {
            console.warn('Failed to load spine assets:', error);
        }
    }

    getSpineAssets() {
        return this.spineCache;
    }

    private getRequireContext(folder: string, extensions: string[]) {
        const extensionPattern = extensions.map(ext => ext.replace('.', '\\.')).join('|');
        const regex = new RegExp(`\\.(${extensionPattern})$`);
        return (require as any).context(folder, false, regex);
    }

    private importAll(context: any): Record<string, any> {
        const assets: Record<string, any> = {};
        context.keys().forEach((item: string) => {
            let asset = context(item);
            if (asset && asset.default) asset = asset.default;
            const key = item.replace(/^\.\//, '');
            assets[key] = asset;
        });
        return assets;
    }
}

// Export singleton instance
export const assetManager = new AssetManager();

// Backward compatibility exports
export const configureAssetLoader = (config: Partial<AssetConfig>) => assetManager.configure(config);
export const loadGameAssets = () => assetManager.loadAssets();
export const loadSpineAssets = () => assetManager.getSpineAssets();

// Dynamic asset getters
export const arts = new Proxy({} as Record<string, any>, {
    get(_, prop) {
        const assets = assetManager.loadedAssets.get('images') || {};
        return assets[prop as string];
    }
});

export const sounds = new Proxy({} as Record<string, any>, {
    get(_, prop) {
        const assets = assetManager.loadedAssets.get('sounds') || {};
        return assets[prop as string];
    }
});