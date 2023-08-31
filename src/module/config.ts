
import { existsSync, readJSONSync, writeJSONSync, writeJson } from "fs-extra"
import { get, set } from "lodash-es";
import { join } from "path";
import { context } from "../context";

export interface JSONDBConfig<T extends Object> {
    sync?: true
    data?: T
}

class JSONDB<T extends Object = Object> {
    private _db: T
    private _path: string
    private _config: JSONDBConfig<T> = {sync: true, data: {} as T}
    constructor(path: string, config?: JSONDBConfig<T>) {
        this._path = path
        this._config = {...this._config, ...config}
        this._db = this.init()
    }

    private init(): T {
        const is_exist_db = existsSync(this._path)
        if (!is_exist_db) {
            let db_data = {}
            if (this._config.sync) db_data = this._config.data
            writeJSONSync(this._path, db_data)
        }
        return readJSONSync(this._path)
    }

    public sync() {
        writeJson(this._path, this._db)
    }

    public get(dir: keyof T) {
        return get(this._db, dir)
    }

    public set(dir: keyof T, data: any) {
        return set(this._db, dir, data)
    }

    public setSync(dir: keyof T, data: any) {
        this.set(dir, data)
        this.sync()
    }
}

export const user_db = new JSONDB(join(context.get("dir").home, "user-config.json"), {
    data: {
        discern: false,
        logger: false,
    }
})
