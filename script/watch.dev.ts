import config_fn from "../esbuild.config"
import { context } from "esbuild"

const build_ctx = context(config_fn({ mode: "watch" }))

build_ctx.then(ctx => ctx.watch())
