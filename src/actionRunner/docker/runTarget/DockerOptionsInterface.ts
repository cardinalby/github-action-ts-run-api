export interface DockerOptionsInterface {
    /**
     * @default {true}
     * @description
     * GitHub guidelines recommend using root user in a container and execute docker run without --user flag.
     * This way, files created in mounted volumes (temp dir, workspace dir) are owned by a container's user
     * which by default is root (uid = 0, guid = 0). For a development it can cause troubles, so default setting
     * is call docker run with uid and gid of the current user.
     *
     * This setting has effect only for linux platform, because docker desktop for Windows and macOS
     * don't map permissions to host files directly, they will be accessible by a current user anyway
     */
    runUnderCurrentLinuxUser: boolean

    /**
     * @default {undefined}
     * @description
     * Docker network name to attach container to. If `undefined`, default Docker bridge network will be used
     */
    network: string|undefined;
}