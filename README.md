# 🎮 PixiJS Playable Ads Template

Template tối ưu cao cho việc tạo **playable ads** với PixiJS, hỗ trợ đa nền tảng và inline assets.

## ✨ Tính năng chính

- 🚀 **Performance cao** - Bundle size tối ưu, tree shaking, code splitting
- 📱 **Đa nền tảng** - AppLovin, Facebook, Mintegral, Unity, Google, TikTok
- 🖼️ **Asset inlining** - Tự động chuyển images/audio thành inline base64
- 🎯 **TypeScript** - Full type safety với strict mode
- 📦 **Webpack tối ưu** - Compression, minification, bundle analysis
- 🎨 **Spine support** - Hỗ trợ Spine animations với texture caching

## 🚀 Quick Start

### 1. Setup project mới
```bash
node setup-template.js
```

### 2. Development
```bash
npm run dev
```

### 3. Build cho tất cả platforms
```bash
npm run build:all
```

### 4. Phân tích bundle size
```bash
npm run analyze
```

## 📁 Cấu trúc project

```
├── src/
│   ├── assetManager.ts      # Asset loader tối ưu
│   ├── assetLoader.config.ts # Cấu hình assets
│   ├── main.ts             # Game logic chính
│   └── index.html          # HTML template
├── Assets/                 # Thư mục chứa assets
│   ├── Images/            # Hình ảnh
│   ├── Sounds/            # Audio files
│   └── Characters/        # Spine animations
└── scripts/               # Build scripts
```

## ⚙️ Cấu hình Assets

Chỉnh sửa [src/assetLoader.config.ts](src/assetLoader.config.ts):

```typescript
export const projectConfig = {
    "spine": {
        "enabled": true,            // Bật/tắt Spine
        "baseName": "hero",         // Tên file spine
        "basePath": "../Assets/Characters",
        "textureAlias": "hero_tex"
    },
    "folders": {
        "arts": "../Assets/Images",    // Thư mục hình ảnh
        "sounds": "../Assets/Sounds"   // Thư mục âm thanh
    }
};
```

## 🎯 Các lệnh build

| Lệnh | Mô tả |
|------|-------|
| `npm run build:applovin` | Build cho AppLovin |
| `npm run build:facebook` | Build cho Facebook |
| `npm run build:mintegral` | Build cho Mintegral |
| `npm run build:unity` | Build cho Unity Ads |
| `npm run build:google` | Build cho Google Ads |
| `npm run build:all` | Build cho tất cả platforms |
| `npm run analyze` | Phân tích bundle size |
| `npm run clean` | Xóa dist folder |

## 📊 Performance Optimizations

### Đã áp dụng:
- ✅ Tree shaking và dead code elimination
- ✅ Terser minification với aggressive settings
- ✅ HTML/CSS/JS minification
- ✅ Gzip compression
- ✅ Asset inlining để giảm HTTP requests
- ✅ Code splitting cho vendors
- ✅ Bundle size warnings

### Kích thước bundle mục tiêu:
- **Total**: < 2MB (sau nén)
- **Main bundle**: < 1MB
- **Vendor bundle**: < 500KB

## 🛠️ Development Tips

### 1. Thêm assets mới
```typescript
// Trong main.ts
const sprite = Sprite.from('your-image.png');
const sound = Sound.from(sounds['your-sound.mp3']);
```

### 2. Debug bundle size
```bash
npm run analyze
# Mở bundle-report.html trong browser
```

### 3. Tối ưu performance
- Sử dụng texture atlases thay vì single images
- Compress audio files trước khi thêm vào project
- Tránh import toàn bộ PIXI, chỉ import cần thiết

## 📱 Platforms được hỗ trợ

- **AppLovin** - MAX SDK
- **Facebook** - Audience Network
- **Mintegral** - Mintegral SDK
- **Unity Ads** - Unity SDK
- **Google** - AdMob
- **TikTok** - TikTok for Business
- **IronSource** - ironSource SDK

## 🔧 Troubleshooting

### Build fails với assets
```bash
# Kiểm tra đường dẫn assets
npm run clean && npm run build
```

### Bundle quá lớn
```bash
# Phân tích bundle
npm run analyze
# Xem report và optimize theo suggestions
```

### TypeScript errors
```bash
# Check configuration
npx tsc --noEmit
```

## 📄 License

MIT License - Tự do sử dụng cho commercial projects.