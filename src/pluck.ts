const pluck = ((path, { keys, pattern }) => {
	const result = pattern.exec(path) ?? [];

	return keys.reduce((p, c, i) => ({ ...p, [c]: result[i + 1] }), {});
}) as <T>(path: string, matcher: { keys: string[]; pattern: RegExp }) => T;

export default pluck;
