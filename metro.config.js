const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo Go 透過反向代理（ngrok static domain）連線時，
// manifest 內的 bundle URL 需不帶 :8081，由 proxy 直接轉發。
// 以 EXPO_PACKAGER_PROXY_URL 指定對外 base URL。
module.exports = config;
