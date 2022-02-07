import os from "os";

/**
 * Name of the docker host inside container
 * https://stackoverflow.com/questions/48546124/what-is-linux-equivalent-of-host-docker-internal/61001152
 */
export function getDockerHostName(): string {
    return os.platform() === 'linux'
        ? '172.17.0.1'
        : 'host.docker.internal';
}