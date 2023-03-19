const array = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

export default array;
