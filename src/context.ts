import config from "../config.json";
import { join } from "path";
import { get, set } from "lodash-es";
import * as process from "process";
import { shellTempOneOffFile } from "../local.json"

declare global {
    interface Context {
        temp_file_name: string
        proxy: string
        dir: {
            home: string
            cache: string
            node: string
            local: string
        }
        currentVersion: string
        runStatus: RunStatus
    }
}

export enum RunStatus {
    normal = 0,
    download = 1,
    extract = 2,
}

class ContextClass<T extends Object> {
    private readonly _cache: T

    constructor(data: any) {
        this._cache = data as T
    }


    public get<K extends keyof T>(key: K): T[K] {
        return get(this._cache, key)
    }

    public set<K extends keyof T>(key: K, data: any) {
        set(this._cache, key, data)
    }

}

function main_context() {
    const dir_home = process.env["NSV_HOME"] || join(__dirname, "../")
    const dir_cache = join(dir_home, config.path.cache)
    const dir_node = join(dir_home, config.path.node)
    const dir_local = join(dir_home, config.path.local)
    const context_data = {
        temp_file_name: shellTempOneOffFile,
        proxy: process.env["https_proxy"] || process.env["HTTPS_PROXY"] || process.env["http_proxy"] || process.env["HTTP_PROXY"] || "",
        runStatus: RunStatus.normal,
        dir: {
            home: dir_home,
            cache: dir_cache,
            node: dir_node,
            local: dir_local,
        }
    }
    return new ContextClass<Context>(context_data)
}
export const context = main_context()


