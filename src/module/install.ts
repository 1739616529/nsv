
import { join, dirname } from "path";
import { EOL } from "os";
import { system, shell, shellConfigFileDir, prefix, isPackaged, userHome } from "../../local.json"
import { copyFile, ensureFileSync, readFileSync, writeFile, constants, existsSync } from "fs-extra";
import { context } from "../context"
import { rm, cp } from "shelljs";
import { prefix as config_prefix } from "../../config.json"
import { set_temp_shell } from "src/lib/env";
const test_reg = /NSV_HOME|nsv discern/
export function install () {
    let content = ""

    ensureFileSync(shellConfigFileDir)
    const shellConfigFileStr = readFileSync(shellConfigFileDir, {encoding: "utf-8"})

    if (test_reg.test(shellConfigFileStr)) return console.log("nsv: installed")

    const shell_config_file_content = shellConfigFileStr.split(EOL)

    const { home } = context.get("dir")

    let _prefix = prefix || config_prefix.name
    // linux macos
    if (system === "linux" || system === "darwin") {
        const NSV_HOME = isPackaged ? "$HOME/.nsv" : home
        // _prefix = join(_prefix, "bin")
        // fish
        if (shell === "fish") {
            shell_config_file_content.push(`set NSV_HOME ${NSV_HOME}`)
            shell_config_file_content.push(`set PATH $NSV_HOME/local/node/bin $NSV_HOME/${_prefix}/bin $PATH`)
            copyFile(join(home, "nsv.fish"), join(dirname(shellConfigFileDir), "functions", "nsv.fish"))
        } else {
            // bash zsh
            shell_config_file_content.push(`export NSV_HOME=${NSV_HOME}`)
            shell_config_file_content.push(`[ -s "$NSV_HOME/nsv.sh" ] && . "$NSV_HOME/nsv.sh"`)
            shell_config_file_content.push(`export PATH=$NSV_HOME/local/node/bin:$NSV_HOME/${_prefix}/bin:$PATH`)
        }

    } else // win
    if (system === "win") {

        shell_config_file_content.push(`$Env:NSV_HOME = "${home}"`)
        shell_config_file_content.push(`$Env:PATH = "$Env:NSV_HOME;$Env:NSV_HOME\\local\\node;$Env:NSV_HOME\\${_prefix};$Env:PATH"`)
    }

    const npmrc_file_dir = join(userHome, ".npmrc")
    if (!prefix) ensureFileSync(npmrc_file_dir); writeFile(npmrc_file_dir, readFileSync(npmrc_file_dir, {encoding: "utf-8"}) + `${EOL}prefix=${join(home, _prefix )}`)
    shell_config_file_content.length && writeFile(shellConfigFileDir, shell_config_file_content.join(EOL), { encoding: "utf-8" })
    content && writeFile(join(context.get("dir").cache, context.get("temp_file_name")), content)
}

export function uninstall () {

    const { home } = context.get("dir")
    ensureFileSync(shellConfigFileDir)
    let shell_config_file_content = readFileSync(shellConfigFileDir, { encoding: "utf-8" }).toString().split(EOL).filter(v => !test_reg.test(v))
    writeFile(shellConfigFileDir, shell_config_file_content.join(EOL), { encoding: "utf-8" })

    const npmrc_file_dir = join(userHome, ".npmrc")
    if (existsSync(npmrc_file_dir)) {
        const prefix_reg = new RegExp(`=.*(${home}).*(prefix)`)
        writeFile(npmrc_file_dir, readFileSync(npmrc_file_dir, {encoding: "utf-8"}).split(EOL).filter(v => !prefix_reg.test(v)).join(EOL))
    }

    /**
     * 如果用的是fish  需要删除 fish functions 中的环境变量
     */
    if(shell === "fish") {
        rm(join(dirname(shellConfigFileDir), "functions", "nsv.fish"))
    }

    console.log(`nsv: uninstall nsv success. Please manually delete dir ==> ${home}`)
}
