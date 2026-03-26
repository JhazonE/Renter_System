const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "WebSdk": require.resolve("@digitalpersona/websdk"),
    "async": require.resolve("async"),
    "sjcl": require.resolve("sjcl"),
    "BigInteger": require.resolve("big-integer"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
