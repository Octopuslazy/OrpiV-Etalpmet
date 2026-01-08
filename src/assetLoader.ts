import { Assets, Texture } from 'pixi.js';

// Simple asset loader for playable ads
export interface AssetLoaderConfig {
    folders: {
        arts: string;
        sounds: string;
    };
    fileExtensions: {
        images: string[];
        sounds: string[];
    };
}

const DEFAULT_CONFIG: AssetLoaderConfig = {
    folders: {
        arts: '../Assets/_arts',
        sounds: '../Assets/Sounds'
    },
    fileExtensions: {
        images: ['.png', '.jpg', '.jpeg', '.svg'],
        sounds: ['.mp3', '.wav', '.ogg']
    }
};

let currentConfig: AssetLoaderConfig = DEFAULT_CONFIG;

export function configureAssetLoader(config: Partial<AssetLoaderConfig>) {
    currentConfig = { ...DEFAULT_CONFIG, ...config };
}

// Simplified asset loading for basic playable ads
export async function loadGameAssets() {
    console.log('Loading game assets...');
    
    // For now, just return empty objects since we don't have actual asset files
    const arts = {};
    const sounds = {};
    return { images: arts, sounds };
}

export async function loadTexture(path: string): Promise<Texture | null> {
    try {
        return (await Assets.load(path)) as Texture;
    } catch (err) {
        console.warn(`Failed to load texture: ${path}`, err);
        return null;
    }
}

export async function loadTextures(paths: string[]): Promise<Record<string, Texture | null>> {
    const out: Record<string, Texture | null> = {};
    await Promise.all(paths.map(async (p) => {
        out[p] = await loadTexture(p);
    }));
    return out;
}

// Export placeholders for backward compatibility
export const arts = {};
export const sounds = {};

export default {
    loadTexture,
    loadTextures,
    loadGameAssets,
    configureAssetLoader
};