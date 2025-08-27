const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add SCSS support
config.resolver.sourceExts.push('scss', 'sass');

module.exports = withNativeWind(config, { input: './global.css' });
