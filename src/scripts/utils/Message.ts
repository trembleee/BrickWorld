const DEV = process.env.NODE_ENV === 'development';

let forceDebug = false;
export const setForceDebug = () => (forceDebug = true);
export const unsetForceDebug = () => (forceDebug = false);

export function logDebug(...args: any[]) {
    if (!forceDebug && !DEV) return;
    console.log(...args);
}

export function printStackTrace() {
    const error = new Error('Stack Trace');
    console.trace(error);
}