/// <reference types="node" />
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins"
import { deflateSync } from "zlib"
import fs from "fs"
import path from "path"

// Gradient matches the login screen exactly:
//   colors: ["#020408", "#050919", "#0A1428"]
//   start: { x: 0.08, y: 0.98 }  end: { x: 0.92, y: 0.08 }
// Plus the two bloom overlays from the login screen.
const SPLASH_BG = "#020408"

// ─── Gradient PNG ─────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf: Buffer) {
  let crc = 0xffffffff
  for (const b of buf) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ b) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer) {
  const t = Buffer.from(type, "ascii")
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function projectOntoGradient(
  nx: number,
  ny: number,
  sx: number,
  sy: number,
  ex: number,
  ey: number
) {
  const dx = ex - sx,
    dy = ey - sy
  return Math.max(0, Math.min(1, ((nx - sx) * dx + (ny - sy) * dy) / (dx * dx + dy * dy)))
}

function buildGradientPNG(W: number, H: number): Buffer {
  const stops = [
    { r: 2, g: 4, b: 8 },
    { r: 5, g: 9, b: 25 },
    { r: 10, g: 20, b: 40 },
  ]

  const rows: number[] = []
  for (let y = 0; y < H; y++) {
    rows.push(0) // PNG row filter byte
    for (let x = 0; x < W; x++) {
      const nx = x / (W - 1),
        ny = y / (H - 1)

      // Base diagonal gradient (same direction as login screen)
      const t = projectOntoGradient(nx, ny, 0.08, 0.98, 0.92, 0.08)
      let r: number, g: number, b: number
      if (t <= 0.5) {
        const s = t * 2
        r = lerp(stops[0].r, stops[1].r, s)
        g = lerp(stops[0].g, stops[1].g, s)
        b = lerp(stops[0].b, stops[1].b, s)
      } else {
        const s = (t - 0.5) * 2
        r = lerp(stops[1].r, stops[2].r, s)
        g = lerp(stops[1].g, stops[2].g, s)
        b = lerp(stops[1].b, stops[2].b, s)
      }

      // Blue bloom — top-right (rgba(60,110,220,0.18))
      const tr = projectOntoGradient(nx, ny, 0.4, 0.6, 1.0, 0.0)
      r = r * (1 - tr * 0.18) + 60 * (tr * 0.18)
      g = g * (1 - tr * 0.18) + 110 * (tr * 0.18)
      b = b * (1 - tr * 0.18) + 220 * (tr * 0.18)

      // Blue bloom — bottom-left (rgba(100,140,220,0.09))
      const bl = projectOntoGradient(nx, ny, 0.0, 1.0, 0.3, 0.55)
      r = r * (1 - bl * 0.09) + 100 * (bl * 0.09)
      g = g * (1 - bl * 0.09) + 140 * (bl * 0.09)
      b = b * (1 - bl * 0.09) + 220 * (bl * 0.09)

      rows.push(clamp(r), clamp(g), clamp(b))
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB color type

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(Buffer.from(rows))),
    pngChunk("IEND", Buffer.alloc(0)),
  ])
}

// ─── Storyboard injection ──────────────────────────────────────────────────────

function injectGradient(storyboard: string): string {
  // 1. Update named background color to the dark base
  storyboard = storyboard.replace(
    /<namedColor name="SplashScreenBackground">[\s\S]*?<\/namedColor>/,
    `<namedColor name="SplashScreenBackground">
            <color alpha="1.000" blue="0.031373" green="0.015686" red="0.007843" customColorSpace="sRGB" colorSpace="custom"/>
        </namedColor>`
  )

  // 2. Declare the gradient image resource (idempotent)
  if (!storyboard.includes('name="SplashGradient"')) {
    storyboard = storyboard.replace(
      /(<resources>)/,
      '$1\n        <image name="SplashGradient" width="200" height="400"/>'
    )
  }

  // 3. Add gradient UIImageView as the first subview (idempotent)
  if (!storyboard.includes('id="SPLASH-GRADIENT-BG"')) {
    storyboard = storyboard.replace(
      /(<subviews>)/,
      `$1
                            <imageView id="SPLASH-GRADIENT-BG" userLabel="GradientBackground" image="SplashGradient" contentMode="scaleToFill" clipsSubviews="true" userInteractionEnabled="false" translatesAutoresizingMaskIntoConstraints="false">
                                <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                            </imageView>`
    )
    storyboard = storyboard.replace(
      /(<constraints>)/,
      `$1
                            <constraint firstItem="SPLASH-GRADIENT-BG" firstAttribute="leading" secondItem="EXPO-ContainerView" secondAttribute="leading" id="splash-grad-leading"/>
                            <constraint firstItem="SPLASH-GRADIENT-BG" firstAttribute="trailing" secondItem="EXPO-ContainerView" secondAttribute="trailing" id="splash-grad-trailing"/>
                            <constraint firstItem="SPLASH-GRADIENT-BG" firstAttribute="top" secondItem="EXPO-ContainerView" secondAttribute="top" id="splash-grad-top"/>
                            <constraint firstItem="SPLASH-GRADIENT-BG" firstAttribute="bottom" secondItem="EXPO-ContainerView" secondAttribute="bottom" id="splash-grad-bottom"/>`
    )
  }

  return storyboard
}

// ─── Config plugin ─────────────────────────────────────────────────────────────

const withSplashGradient: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const root = config.modRequest.platformProjectRoot
      const name = config.name ?? "Vesta"

      // Write gradient PNG into the asset catalog
      const imagesetDir = path.join(root, name, "Images.xcassets", "SplashGradient.imageset")
      fs.mkdirSync(imagesetDir, { recursive: true })
      fs.writeFileSync(path.join(imagesetDir, "gradient.png"), buildGradientPNG(200, 400))
      fs.writeFileSync(
        path.join(imagesetDir, "Contents.json"),
        JSON.stringify({
          images: [
            { idiom: "universal", filename: "gradient.png", scale: "1x" },
            { idiom: "universal", scale: "2x" },
            { idiom: "universal", scale: "3x" },
          ],
          info: { version: 1, author: "expo" },
        })
      )

      // Inject gradient into the storyboard
      const storyboardPath = path.join(root, name, "SplashScreen.storyboard")
      if (fs.existsSync(storyboardPath)) {
        fs.writeFileSync(storyboardPath, injectGradient(fs.readFileSync(storyboardPath, "utf-8")))
      }

      // Update the background colorset
      const colorsetPath = path.join(
        root,
        name,
        "Images.xcassets",
        "SplashScreenBackground.colorset",
        "Contents.json"
      )
      if (fs.existsSync(colorsetPath)) {
        const colorset = JSON.parse(fs.readFileSync(colorsetPath, "utf-8"))
        colorset.colors[0].color.components = {
          alpha: "1.000",
          blue: "0.03137254902",
          green: "0.01568627451",
          red: "0.00784313725",
        }
        fs.writeFileSync(colorsetPath, JSON.stringify(colorset, null, 2))
      }

      return config
    },
  ])

  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const colorsPath = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/values/colors.xml"
      )
      if (fs.existsSync(colorsPath)) {
        fs.writeFileSync(
          colorsPath,
          fs
            .readFileSync(colorsPath, "utf-8")
            .replace(
              /<color name="splashscreen_background">[^<]*<\/color>/,
              `<color name="splashscreen_background">${SPLASH_BG}</color>`
            )
        )
      }
      return config
    },
  ])

  return config
}

export default withSplashGradient
