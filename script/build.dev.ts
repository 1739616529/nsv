import config_fn from "../esbuild.config"
import { build } from "esbuild"

build(config_fn({ mode: "build" }))
