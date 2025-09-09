# App Icon Requirements for Google Play Store

## Current Icon Files
- `assets/icon.png` - Main app icon (1024x1024 recommended)
- `assets/adaptive-icon.png` - Android adaptive icon foreground
- `assets/favicon.png` - Web favicon

## Google Play Store Icon Requirements

### 1. **App Icon (High-res icon)**
- **Size**: 512 x 512 pixels
- **Format**: PNG (no JPEG)
- **File size**: Max 1MB
- **Design**: 32-bit PNG with alpha channel
- **No transparency**: Background should be solid color or gradient

### 2. **Feature Graphic**
- **Size**: 1024 x 500 pixels
- **Format**: JPEG or PNG
- **Purpose**: Used in Play Store listing

### 3. **Screenshots**
- **Phone**: At least 2 screenshots (320dp to 3840dp on any side)
- **Recommended**: 1080 x 1920 pixels (portrait) or 1920 x 1080 pixels (landscape)
- **Format**: JPEG or PNG

## Icon Design Guidelines

### ✅ **Do:**
- Use simple, recognizable imagery
- Ensure readability at small sizes
- Use consistent color scheme (#22C55E brand color)
- Make it unique and memorable
- Test on different backgrounds
- Follow Material Design guidelines

### ❌ **Don't:**
- Use text that's too small to read
- Include complex details that disappear when scaled
- Use copyrighted content
- Make it too similar to existing apps
- Use low resolution images

## Current Brand Colors
- **Primary**: #22C55E (Green)
- **Background**: #FFFFFF (White)
- **Secondary**: #6B7280 (Gray)

## Icon Checklist for Play Store

- [ ] High-res icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] App screenshots (minimum 2)
- [ ] Icon follows Material Design guidelines
- [ ] Icon is unique and represents the brand
- [ ] All icons are properly sized and optimized
- [ ] Privacy policy uploaded
- [ ] App description completed

## Tools for Icon Creation
- **Adobe Illustrator/Photoshop** - Professional design
- **Canva** - Easy online tool
- **Figma** - Free design tool
- **GIMP** - Free alternative

## Next Steps
1. Design new high-resolution icons following the guidelines
2. Create feature graphic for Play Store
3. Take app screenshots
4. Update `assets/icon.png` with 1024x1024 version
5. Update `assets/adaptive-icon.png` for Android
6. Test icons on different devices and backgrounds

## File Structure After Update
```
assets/
├── icon.png (1024x1024 - Main icon)
├── adaptive-icon.png (1024x1024 - Android adaptive foreground)
├── favicon.png (256x256 - Web favicon)
├── splash-icon.png (Existing splash screen)
├── play-store-icon.png (512x512 - Play Store icon)
├── feature-graphic.png (1024x500 - Play Store feature graphic)
└── screenshots/ (App screenshots for store listing)
```
