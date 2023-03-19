import { describe, expect, it } from 'vitest';
import pluck from './pluck.js';
import { parse } from 'regexparam';

describe('pluck', () => {
	it('plucks matched params', () => {
		expect(pluck('/users/42', parse('/users/:id'))).toMatchObject({ id: '42' });
		expect(pluck('/users/42/blog', parse('/users/:id/blog'))).toMatchObject({
			id: '42',
		});
		expect(
			pluck('/users/42/blog/first-post', parse('/users/:id/blog/:slug'))
		).toMatchObject({ id: '42', slug: 'first-post' });
	});
});
