#!/bin/bash
# Build script for Google Play Store deployment

echo "🚀 Namma Kadai - Play Store Build Script"
echo "======================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS login status..."
eas whoami || eas login

# Build for production (AAB for Play Store)
echo "📦 Building production AAB for Play Store..."
eas build --platform android --profile production

echo "✅ Build complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Download the AAB file from EAS dashboard"
echo "2. Upload to Google Play Console"
echo "3. Complete store listing with:"
echo "   - App description (see PLAY_STORE_DESCRIPTION.md)"
echo "   - Screenshots"
echo "   - Feature graphic"
echo "   - Privacy policy (see PRIVACY_POLICY.md)"
echo "4. Submit for review"

# Optional: Build APK for testing
read -p "🤔 Do you want to build APK for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Building APK for testing..."
    eas build --platform android --profile production-apk
fi

echo "🎉 All done! Check EAS dashboard for build status."
