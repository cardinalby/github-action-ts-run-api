export function unescapePropertyValue(value: string): string {
    return value
        .replace('%2C', ',')
        .replace('%3A', ":")
        .replace('%0A', "\n")
        .replace('%0D', "\r")
        .replace('%25', '%')
}

export function unescapeCommandValue(value: string): string {
    return value
        .replace('%0A', "\n")
        .replace('%0D', "\r")
        .replace('%25', '%')
}