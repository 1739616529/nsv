import { BuildOptions, BuildOptionFn } from "esbuild";
import { join } from "path"
import pkg from "./package.json"
export default <BuildOptionFn>function ({ mode }) {
    const config: BuildOptions = {

        // 产物运行环境
        platform: "node",

        // 是否打包模块
        bundle: true,

        // 入口文件
        entryPoints: [
            join(__dirname, "./src/index.ts"),
            join(__dirname, "./src/init.ts")
        ],

        // 输出文件
        // outfile: join(__dirname, "./dist/index.js"),
        outdir: join(__dirname, "dist"),

        // 别名
        alias: {
            "src": join(__dirname, "./src"),
            "project": __dirname,
        },

        // 排除打包的库
        // @ts-ignore
        external: [...Object.keys(pkg["dependencies"] || {})],

        // 编译目标
        format: "cjs",

        // splitting: true,

        // bnode版本兼容 最低版本
        target: ['node14'],

        // 代码压缩
        minify: mode === "build",

        // 源码映射
        sourcemap: mode === "watch" ? "inline" : false,
    }

    return config
}
