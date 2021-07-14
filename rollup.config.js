import { nodeResolve } from "@rollup/plugin-node-resolve"
import { babel } from "@rollup/plugin-babel"
import pkg from "./package.json"

export default {
  input: "./src/FontPicker.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  plugins: [
    nodeResolve(),
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/env", "@babel/preset-react"],
    }),
  ],
  external: ["@samuelmeuli/font-manager", "react"],
}
