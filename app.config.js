const expoPkg = require('expo/package.json');

function deriveExpoGoRuntimeVersion() {
  const cleanVersion = String(expoPkg.version || '').replace(/^[^\d]*/, '');
  const [major = '54', minor = '0'] = cleanVersion.split('.');
  return `exposdk:${major}.${minor}.0`;
}

module.exports = ({ config }) => {
  const updateTrack = process.env.EXPO_UPDATE_TRACK;
  const finalConfig = { ...config };

  if (updateTrack === 'expo-go-preview') {
    finalConfig.runtimeVersion = deriveExpoGoRuntimeVersion();
  }

  return finalConfig;
};
