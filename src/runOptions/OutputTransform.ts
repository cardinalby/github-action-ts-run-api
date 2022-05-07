import {Duplex} from "stream";
import {CommandsSanitizerStream} from "../stdout/CommandsSanitizerStream";

export enum OutputTransform {
    /**
     * Print action stdout directly to the process stdout
     */
    NONE = 'none',

    /**
     * Detect commands start "::" and replace with "⦂⦂"
     */
    SANITIZE_COMMANDS = 'sanitize_cmds'
}

export function getTransformStream(transform: OutputTransform): Duplex|undefined {
    switch (transform) {
        case OutputTransform.SANITIZE_COMMANDS: return new CommandsSanitizerStream();
    }
    return undefined;
}