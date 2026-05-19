const { FlatCompat } = require("@eslint/eslintrc")
const js = require("@eslint/js")

const legacyConfig = require("./.eslintrc.js")

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "ios/**",
      "android/**",
      ".expo/**",
      ".vscode/**",
      "coverage/**",
      "dist/**",
      "vesta_mobile_app/**",
      "eslint.config.js",
      ".eslintrc.js",
      "jest.config.js",
      "babel.config.js",
      ".dependency-cruiser.js",
    ],
  },
  ...compat.config(legacyConfig),
]
