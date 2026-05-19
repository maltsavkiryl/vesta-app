/// <reference types="node" />
import { ConfigPlugin, withDangerousMod, withXcodeProject } from "@expo/config-plugins"
import fs from "fs"
import path from "path"

const WIDGET_NAME = "VestaClockWidget"

const withLiveActivity: ConfigPlugin = (config) => {
  config = withExtensionDeclaration(config)
  config = withCopyNativeFiles(config)
  config = withXcodeChanges(config)
  return config
}

const withExtensionDeclaration: ConfigPlugin = (config) => {
  const appBundleId = config.ios?.bundleIdentifier ?? "services.vesta.mobile"
  const widgetBundleId = `${appBundleId}.${WIDGET_NAME}`
  const existingAppExtensions = config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []
  const nextAppExtensions = [
    ...existingAppExtensions.filter((extension: any) => extension?.targetName !== WIDGET_NAME),
    {
      targetName: WIDGET_NAME,
      bundleIdentifier: widgetBundleId,
      entitlements: {},
    },
  ]

  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        build: {
          ...config.extra?.eas?.build,
          experimental: {
            ...config.extra?.eas?.build?.experimental,
            ios: {
              ...config.extra?.eas?.build?.experimental?.ios,
              appExtensions: nextAppExtensions,
            },
          },
        },
      },
    },
  }
}

// ─── File copy step ─────────────────────────────────────────────────────────

const withCopyNativeFiles: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const iosRoot = cfg.modRequest.platformProjectRoot
      const pluginIos = path.join(__dirname, "ios")

      // Main app target files
      const appTarget = path.join(iosRoot, "Vesta")
      copyFile(pluginIos, appTarget, "VestaLiveActivityModule.swift")
      copyFile(pluginIos, appTarget, "VestaLiveActivityModule.m")

      // Bridging header
      fs.writeFileSync(
        path.join(appTarget, "Vesta-Bridging-Header.h"),
        "#import <React/RCTBridgeModule.h>\n",
      )

      // Widget extension files
      const widgetTarget = path.join(iosRoot, WIDGET_NAME)
      fs.mkdirSync(widgetTarget, { recursive: true })
      const widgetSrc = path.join(pluginIos, WIDGET_NAME)
      for (const file of fs.readdirSync(widgetSrc)) {
        copyFile(widgetSrc, widgetTarget, file)
      }

      return cfg
    },
  ])

function copyFile(srcDir: string, dstDir: string, filename: string) {
  fs.copyFileSync(path.join(srcDir, filename), path.join(dstDir, filename))
}

// Adds an already-referenced file (created by addPbxGroup) to a target's Sources phase.

function addFileToTargetSources(project: any, filename: string, targetUuid: string): boolean {
  const fileRefs = project.pbxFileReferenceSection()

  let fileRefUuid: string | null = null
  for (const key of Object.keys(fileRefs)) {
    if (key.endsWith("_comment")) continue
    const ref = fileRefs[key]
    if (ref.path === filename || ref.path === `"${filename}"`) {
      fileRefUuid = key
      break
    }
  }

  if (!fileRefUuid) return false

  const buildFileUuid = generateUuid()
  const comment = `${filename} in Sources`

  project.pbxBuildFileSection()[buildFileUuid] = {
    isa: "PBXBuildFile",
    fileRef: fileRefUuid,
    fileRef_comment: filename,
  }
  project.pbxBuildFileSection()[`${buildFileUuid}_comment`] = comment

  const sourcesPhase = project.pbxSourcesBuildPhaseObj(targetUuid)
  if (sourcesPhase) {
    sourcesPhase.files.push({ value: buildFileUuid, comment })
  }

  return true
}

// ─── Xcode project step ─────────────────────────────────────────────────────

const withXcodeChanges: ConfigPlugin = (config) =>
  withXcodeProject(config, (cfg) => {
    const project = cfg.modResults
    const appBundleId = cfg.ios?.bundleIdentifier ?? "services.vesta.mobile"
    const widgetBundleId = `${appBundleId}.${WIDGET_NAME}`

    // Skip if widget target already added (idempotent)
    const nativeTargets = project.pbxNativeTargetSection()
    const alreadyAdded = Object.values(nativeTargets).some(
      (t: any) => t.name === `"${WIDGET_NAME}"` || t.name === WIDGET_NAME,
    )
    if (alreadyAdded) {
      return cfg
    }

    // ── 1. Main app: add module files to Vesta group ─────────────────────

    const vestaGroupKey = project.findPBXGroupKey({ name: "Vesta" })
    const mainTargetUuid = project.getFirstProject().firstProject.targets[0].value

    for (const filename of ["VestaLiveActivityModule.swift", "VestaLiveActivityModule.m"]) {
      project.addSourceFile(`Vesta/${filename}`, { target: mainTargetUuid }, vestaGroupKey)
    }

    // ── 2. Widget group ───────────────────────────────────────────────────

    const widgetFiles = [
      "ClockActivityAttributes.swift",
      "ClockWidgetBundle.swift",
      "ClockWidgetLiveActivity.swift",
    ]

    const widgetGroupResult = project.addPbxGroup(widgetFiles, WIDGET_NAME, WIDGET_NAME)

    const mainGroupKey = project.getFirstProject().firstProject.mainGroup
    project.addToPbxGroup(widgetGroupResult.uuid, mainGroupKey)

    // ── 3. Widget target ─────────────────────────────────────────────────
    //   addTarget for app_extension automatically:
    //   - adds a "Copy Files" embed phase in the main target
    //   - adds a target dependency from the main target

    const widgetTarget = project.addTarget(
      WIDGET_NAME,
      "app_extension",
      WIDGET_NAME,
      widgetBundleId,
    )
    const widgetTargetUuid = widgetTarget.uuid
    project.addTargetAttribute("ProvisioningStyle", "Automatic", widgetTarget)

    // ── 4. Build phases for widget target ─────────────────────────────────

    project.addBuildPhase([], "PBXSourcesBuildPhase", "Sources", widgetTargetUuid)
    project.addBuildPhase([], "PBXFrameworksBuildPhase", "Frameworks", widgetTargetUuid)

    // ── 5. Add widget source files to the Sources phase ───────────────────
    // addPbxGroup already created file references; link them to the widget's Sources phase manually
    // because addSourceFile's hasFile check prevents adding already-referenced files.

    for (const filename of widgetFiles) {
      addFileToTargetSources(project, filename, widgetTargetUuid)
    }

    // ── 6. Override build settings for the widget target ─────────────────

    const buildConfigs = project.pbxXCBuildConfigurationSection()
    for (const key of Object.keys(buildConfigs)) {
      if (key.endsWith("_comment")) continue
      const cfg2 = buildConfigs[key]
      if (cfg2.buildSettings?.PRODUCT_NAME !== `"${WIDGET_NAME}"`) continue

      cfg2.buildSettings.SWIFT_VERSION = '"5.0"'
      cfg2.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '"16.2"'
      cfg2.buildSettings.INFOPLIST_FILE = `"${WIDGET_NAME}/Info.plist"`
      cfg2.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`
      cfg2.buildSettings.CODE_SIGN_STYLE = '"Automatic"'
      cfg2.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"'
      cfg2.buildSettings.CLANG_ENABLE_MODULES = '"YES"'
    }

    return cfg
  })

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateUuid(): string {
  return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    .replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
    .toUpperCase()
    .slice(0, 24)
}

export default withLiveActivity
