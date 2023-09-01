import { writeJSONSync, readJSONSync, ensureDir, ensureFileSync, existsSync, readFileSync } from "fs-extra";
import { join, sep } from "path";
import { system_and_arch, Platform, Arch } from "./util/system"
import { version } from "../package.json"
import { execSync } from "child_process"
import { EOL } from "os";

type DitcPlatform<T = ""> = {
    [K in Platform]: T
}


export enum EnumFileExendison {
    zip = "zip",
    gz = "tar.gz",
    xz = "tar.xz",
}
const [system, arch] = system_and_arch()
console.log(system, arch)
const home = join(__dirname, "../")


export const get_remote_node_file_extension = function () {

    const darwin_linux = () => {
        const xz_msg = execSync("tar --help | grep xz").toString()
        const is_supper_xz = /J|xz/.test(xz_msg)
        return is_supper_xz ? EnumFileExendison.xz : EnumFileExendison.gz
    }

    const ditc_file_extension: DitcPlatform<() => EnumFileExendison> = ({
        "win": () => EnumFileExendison.zip,
        "darwin": darwin_linux,
        "linux": darwin_linux,
    })


    return ditc_file_extension[system]()

}

const get_unzip_order = function () {
    const ditc_unzip_order: DitcPlatform<string> = {
        "win": "",
        "darwin": "tar",
        "linux": "tar",
    }
    return ditc_unzip_order[system]
}

const get_shell_name = function () {
    let shell = "powershell"

    if (system === "win") return shell



}

const get_temp_script_tmpl = function () {
    const ditc_temp_script_content = {
        "powershell": `
            $Env:Path = "{{ content }}"
        `,
        "bash": `
            export PATH="{{ content }}"
        `,
        "zsh": `
            export PATH="{{ content }}"
        `,
        "fish": `
            set PATH "{{ content }}"
        `,
        "default": `
            export PATH="{{ content }}"
        `,
    }
}
function set_local_env() {

    const ditc_temp_script_content = {
        "powershell": `
            $Env:Path = "{{ content }}"
        `,
        "bash": `
            export PATH="{{ content }}"
        `,
        "zsh": `
            export PATH="{{ content }}"
        `,
        "fish": `
            set PATH "{{ content }}"
        `,
        "default": `
            export PATH="{{ content }}"
        `,
    }

    const ditc_temp_local_script_content = {
        "win": `New-Item -ItemType SymbolicLink -Value "{{ target }}" -Path "{{ output }}"`,
        "default": `ln -s "{{ target }}" "{{ output }}"`
    }

    const ditc_sudo_shell_content = {
        "win": `$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

            if (-not $isAdmin) {
                Start-Process powershell.exe "-File $PSCommandPath" -Verb RunAs
                return
            }
        `,
        "default": "sudo ",
    }

    let shell = "powershell"
    let shellConfigFileDir = ""
    let shellTempOneOffFile = "nsv_temp_one_off_file"
    if (system === "win") {
        shellConfigFileDir = join(process.env.USERPROFILE, "Documents", "WindowsPowerShell", "Microsoft.PowerShell_profile.ps1")
        shellTempOneOffFile += ".ps1"
    } else
        if (system === "linux" || system === "darwin") {
            const shell_name = process.env.SHELL
            if (/bash/.test(shell_name)) {
                shell = "bash"
                shellConfigFileDir = ".bashrc"
                shellTempOneOffFile += ".sh"
            } else if (/zsh/.test(shell_name)) {
                shell = "zsh"
                shellConfigFileDir = ".zshrc"
                shellTempOneOffFile += ".sh"
            } else if (/fish/.test(shell_name)) {
                shell = "fish"
                shellConfigFileDir = ".config/fish/config.fish"
                shellTempOneOffFile += ".fish"
            }
            shellConfigFileDir = `${process.env.HOME}/${shellConfigFileDir}`
        }


    const ditc_user_home_dir = {
        "win": process.env["USERPROFILE"],
        "default": process.env["HOME"]
    }


    // mac系统统一用cpu类型为 x86 的版本 不需要考虑32位系统 mac没有
    let _arch = arch
    if (system === "darwin") _arch = "x64"
    const local = {
        version,
        system,
        arch: _arch,
        shell,
        shellConfigFileDir,
        shellTempOneOffFile,
        shellTempOneOffFileAbsDir: join(home, "cache", shellTempOneOffFile),
        userHome: ditc_user_home_dir[system] || ditc_user_home_dir["default"],

        remoteNodeFileExtension: get_remote_node_file_extension(),

        unzipOrder: get_unzip_order(),
        sudoShellContent: ditc_sudo_shell_content[system] || ditc_sudo_shell_content["default"],
        tempScriptContent: ditc_temp_script_content[shell] || ditc_temp_script_content["default"],
        tempLocalScriptContent: ditc_temp_local_script_content[system] || ditc_temp_local_script_content["default"],
        isPackaged: !existsSync(join(__dirname, "../src"))
    }
    writeJSONSync(join(home, "./local.json"), local, {
        encoding: "utf-8"
    })
}

set_local_env()
