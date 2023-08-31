import { BuildOptions } from "esbuild"
declare module "esbuild" {
    interface BuildOptionFnContext {
        mode: "watch"|"build"
    }
    type BuildOptionFn = (context: BuildOptionFnContext) => BuildOptions
}
