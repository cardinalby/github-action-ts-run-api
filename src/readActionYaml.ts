import * as yaml from "yaml";
import fs from "fs-extra";

export async function readActionYaml(filePath: string = 'action.yml') {
    try {
        return yaml.parse((await fs.readFile(filePath)).toString())
    } catch (err) {
        throw new Error("Can't parse action.yml. " + err);
    }
}