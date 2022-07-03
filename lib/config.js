import { join } from "node:path";
import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { configFile } from "./utils.js";
import { exit } from "node:process";
import { existsSync } from "node:fs";

let config = false;

async function saveConfig() {
    await writeFile(JSON.stringify(config));
}

try {
    if (existsSync(configFile)) {
        const tmpConfig = await readFile(configFile);
        config = JSON.parse(tmpConfig);
    } else {
        console.error("Missing config file:", configFile);
        // exit(1);
    }
} catch (error) {
    console.error("config parse error:", error);
    exit(1);
}

export default config;
