import { describe, expect, it } from 'vitest';
import array from './array.js';

describe('array()', () => {
	it('returns an array when applied with an array', () => {
		const result = array([1]);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toMatchObject([1]);
	});

	it('returns an array when applied with a value', () => {
		const result = array(1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toMatchObject([1]);
	});
});
