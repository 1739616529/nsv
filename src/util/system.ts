
export type Platform = "win"|"darwin"|"linux"
export type Arch = "arm"|"x32"|"x64"
export function system_and_arch(): [Platform, Arch] {
    let arch = process.arch as string
    if (!/arm|x(32|64)/.test(arch)) arch = ""

    let system = process.platform as string
    if (!/win32|linux|darwin/.test(system)) system = ""

    return [ system.replace(/\d+/, "") as Platform, arch as Arch ]
}
