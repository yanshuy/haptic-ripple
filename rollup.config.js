import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.module,
            format: "es",
            exports: "named",
        },
        {
            file: "dist/index.umd.js",
            format: "umd",
            name: "HapticRipple",
            exports: "named",
        },
    ],
    plugins: [
        resolve(),
        typescript({
            tsconfigOverride: {
                exclude: ["**/*.test.ts"],
            },
        }),
    ],
};
