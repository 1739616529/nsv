const { join } = require("path");
const { exec } = require("shelljs");
const { existsSync } = require("fs-extra");


existsSync(join(__dirname, "../dist/init.js")) && require("../dist/init")

// 如果是在 github ci 中或者 nsv install 的
if ("GITHUB_ENV" in process.env || process.env["NSV_STATUS"] === 2) process.exit(0)
exec(`${join(__dirname, "../nsv")} install`)