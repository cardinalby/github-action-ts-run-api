export function unescapeCommandValue(value: string): string {
    return value
        .replace('%25', '%')
        .replace('%0D', "\r")
        .replace('%0A', "\n")
}

export function unescapePropertyValue(value: string): string {
    return value
        .replace('%25', '%')
        .replace('%0D', "\r")
        .replace('%0A', "\n")
        .replace('%3A', ":")
        .replace('%2C', ',');
}