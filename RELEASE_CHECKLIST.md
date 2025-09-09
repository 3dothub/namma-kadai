# 🚀 Google Play Store Release Checklist

## Pre-Release Preparation

### 📱 App Configuration
- [ ] Update app version in `app.json` (currently 1.0.0)
- [ ] Set `userInterfaceStyle` to "automatic"
- [ ] Add app description and keywords
- [ ] Configure Android permissions properly
- [ ] Set up proper bundle identifiers

### 🎨 App Assets
- [ ] **App Icon (512x512)** - High-resolution PNG for Play Store
- [ ] **Adaptive Icon (1024x1024)** - Android adaptive icon foreground
- [ ] **Feature Graphic (1024x500)** - Play Store banner image
- [ ] **Screenshots** - Minimum 2, recommended 4-8 screenshots
- [ ] **Splash Screen** - Loading screen with brand colors

### 📄 Legal & Documentation
- [ ] **Privacy Policy** - Created and accessible online
- [ ] **Terms of Service** - App usage terms
- [ ] **App Description** - Compelling store listing description
- [ ] **Content Rating** - Complete content rating questionnaire

### 🔧 Technical Setup
- [ ] **EAS Build Configuration** - Properly configured `eas.json`
- [ ] **Android Signing** - Production signing key set up
- [ ] **Permissions** - Only necessary permissions requested
- [ ] **Proguard** - Enabled for release builds
- [ ] **Testing** - Comprehensive testing on multiple devices

## Build Process

### 🏗️ Android Studio Build Process
```bash
# Generate native Android project
npx expo run:android --no-install --no-bundler

# Or use prebuild to generate android folder
npx expo prebuild --platform android --clean

# Open in Android Studio
# File > Open > [project]/android
```

### 📦 Android Studio Bundle Creation
- [ ] Open project in Android Studio
- [ ] Select "Build" > "Generate Signed Bundle / APK"
- [ ] Choose "Android App Bundle (.aab)" for Play Store
- [ ] Configure signing key (create new or use existing)
- [ ] Select "release" build variant
- [ ] Generate bundle for upload

### 🔑 Signing Configuration
- [ ] Create or import signing keystore
- [ ] Configure `android/app/build.gradle` with signing config
- [ ] Secure keystore file (don't commit to version control)
- [ ] Document keystore password and alias securely

## Play Store Console Setup

### 🏪 Store Listing
- [ ] **App Title**: "Namma Kadai"
- [ ] **Short Description**: 80 characters max
- [ ] **Full Description**: Compelling description with keywords
- [ ] **Category**: Shopping
- [ ] **Content Rating**: Appropriate rating
- [ ] **Pricing**: Free (with in-app features)

### 🖼️ Store Assets Upload
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Phone screenshots (2-8 images)
- [ ] Store listing screenshots

### 📋 App Information
- [ ] **Privacy Policy URL**: Link to hosted privacy policy
- [ ] **Website**: Official website or landing page
- [ ] **Contact Email**: Support email address
- [ ] **Target Audience**: Age group and audience

### 🔐 App Signing
- [ ] Upload app bundle (AAB file)
- [ ] Configure app signing (Google Play App Signing recommended)
- [ ] Verify signing certificate

## Testing & Release

### 🧪 Internal Testing
- [ ] Create internal testing track
- [ ] Upload initial build
- [ ] Test with internal team
- [ ] Fix any critical issues

### 🔍 Pre-Launch Report
- [ ] Review Play Console pre-launch report
- [ ] Address any identified issues
- [ ] Ensure app stability and performance

### 📢 Release Preparation
- [ ] **Release Track**: Choose production, closed testing, or open testing
- [ ] **Rollout Percentage**: Start with small percentage (20%)
- [ ] **Release Notes**: Clear description of features and fixes
- [ ] **Countries**: Select target countries/regions

## Post-Release

### 📊 Monitoring
- [ ] Monitor crash reports in Play Console
- [ ] Track app performance metrics
- [ ] Monitor user reviews and ratings
- [ ] Check download and engagement stats

### 🔄 Updates
- [ ] Set up update process for future releases
- [ ] Monitor for security updates
- [ ] Plan feature updates based on user feedback

## Commands Quick Reference

```bash
# Development
npm start                    # Start development server
npm run android             # Run on Android emulator

# Building
npm run build:android       # Build production AAB
npm run build:android-apk   # Build production APK
npm run build:preview       # Build preview APK

# Submission
npm run submit:android      # Submit to Play Store
npm run update              # Push OTA update

# Complete release process
npm run release             # Build and submit
```

## Important Notes

1. **First Release**: May take 1-3 days for review
2. **App Signing**: Use Google Play App Signing for easier management
3. **Testing**: Always test production builds before release
4. **Metadata**: Keep store listing updated with new features
5. **Reviews**: Respond to user reviews professionally

## Support Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

---

**Ready for launch? 🚀**

Complete this checklist step by step to ensure a successful Play Store release!
