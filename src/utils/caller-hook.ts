// Create a deep proxy to detect which function is called and receive the params.
export const withCallerHook = <T extends object> (target: T): T => {
    return target
}
