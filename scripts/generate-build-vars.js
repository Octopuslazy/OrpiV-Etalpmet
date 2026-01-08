const fs = require('fs');
const path = require('path');

// Read package.json to get playable config
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const playableConfig = packageJson.playable || {};

// Get app store URLs from package.json
const googlePlayUrl = playableConfig.googlePlayUrl || 'https://play.google.com/store/games';
const appStoreUrl = playableConfig.appStoreUrl || 'https://www.apple.com/app-store/';

// Generate build variables
const buildVars = {
  GOOGLE_PLAY_URL: googlePlayUrl,
  APP_STORE_URL: appStoreUrl,
  AD_NETWORK: process.env.AD_NETWORK || 'preview',
  AD_PROTOCOL: 'mraid', // Default protocol
  BUILD_HASH: Date.now().toString(),
};

console.log('🔧 Generated build variables:');
console.log('📱 Google Play URL:', googlePlayUrl);
console.log('🍎 App Store URL:', appStoreUrl);
console.log('🌐 Ad Network:', buildVars.AD_NETWORK);
console.log('📦 Build Hash:', buildVars.BUILD_HASH);

// Create src/build-vars.ts file
const buildVarsContent = `// Auto-generated build variables
declare global {
  const GOOGLE_PLAY_URL: string;
  const APP_STORE_URL: string;
  const AD_NETWORK: string;
  const AD_PROTOCOL: string;
  const BUILD_HASH: string;
}

// Export for TypeScript module resolution
export {};
`;

// Ensure src directory exists
const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

// Write build vars
fs.writeFileSync(path.join(srcDir, 'build-vars.ts'), buildVarsContent);

console.log('✅ Build variables generated successfully!');