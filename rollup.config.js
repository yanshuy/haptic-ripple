import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            exports: "named",
        },
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
        commonjs(),
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                exclude: ["**/*.test.ts", "**/*.test.tsx"],
            },
        }),
    ],
};
