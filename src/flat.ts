export const flat = <T>(array: T[][]): T[] => ([] as T[]).concat(...array);
