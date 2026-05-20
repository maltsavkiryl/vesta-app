import { ExpoConfig, ConfigContext } from "@expo/config"

/**
 * Use tsx/cjs here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript.
 *
 * See https://docs.expo.dev/config-plugins/plugins/#add-typescript-support-and-convert-to-dynamic-app-config
 */
import "tsx/cjs"

/**
 * Single source of truth for Expo app configuration.
 *
 * You can read more about Expo's configuration rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
module.exports = (_: ConfigContext): ExpoConfig => {
  return {
    name: "Vesta",
    slug: "vesta",
    scheme: "vesta",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/images/app-icon-all.png",
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    android: {
      icon: "./assets/images/app-icon-android-legacy.png",
      package: "services.vesta.mobile",
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-icon-android-adaptive-foreground.png",
        backgroundImage: "./assets/images/app-icon-android-adaptive-background.png",
      },
      allowBackup: false,
    },
    ios: {
      icon: "./assets/images/app-icon-ios.png",
      supportsTablet: true,
      bundleIdentifier: "services.vesta.mobile",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "Allow Vesta to capture your work location for clock-in, breaks, and clock-out.",
        NSSupportsLiveActivities: true,
      },
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    web: {
      favicon: "./assets/images/app-icon-web-favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-localization",
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-logo.png",
          imageWidth: 300,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF",
        },
      ],
      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Light",
            enforceNavigationBarContrast: false,
          },
        },
      ],
      "expo-build-properties",
      "expo-router",
      "@react-native-community/datetimepicker",
      "./plugins/withLiveActivity",
      [
        "expo-image-picker",
        {
          cameraPermission: "Allow Vesta to take photos of documents for upload.",
          photosPermission: "Allow Vesta to choose document photos for upload.",
        },
      ],
      [
        "expo-camera",
        {
          barcodeScannerEnabled: true,
          cameraPermission: "Allow Vesta to scan employer QR codes.",
        },
      ],
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Allow Vesta to use Face ID to unlock the app.",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow Vesta to capture your work location for clock-in, breaks, and clock-out.",
        },
      ],
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
    extra: {
      ignite: {
        version: "11.5.0",
      },
      build: {
        profile: process.env.EAS_BUILD_PROFILE ?? null,
      },
      router: {},
      eas: {
        projectId: "3599d2c2-1d60-44a0-991e-062ed8475afd",
      },
    },
    owner: "kirylmaltsav",
  }
}
