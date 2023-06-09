// import { request, RequestOptions, globalAgent } from "http";
import { request, RequestOptions, Agent, AgentOptions } from "https";
import { HttpsProxyAgent } from "https-proxy-agent"
import { context } from "../context";
import url from "url";
export function get<T>(uri: string,) {
    const url_option = url.parse(uri)
    return req<T>(url_option)
}

export function use_proxy<T extends RequestOptions | url.URL>(opt: T) {
    const proxy = context.get("proxy")
    if (proxy) {
        opt["agent"] = new HttpsProxyAgent(proxy)
    }
    return opt
}

function req<T>(option: RequestOptions | url.URL): Promise<{ code: number, data: T }> {
    use_proxy(option)
    return new Promise((resolve, reject) => {
        request(option, (res) => {
            let data = ""
            const code = res.statusCode
            res.on("data", (chunk) => {
                data += chunk
            })
            res.on("end", () => {
                resolve({ code, data: JSON.parse(data) })
            })
            res.on("error", reject)
        }).end()
    })
}
