import { beforeEach, describe, expect, it } from 'vitest';
import match from './match.js';

declare module 'vitest' {
	export interface TestContext {
		context: import('@netlify/functions').HandlerContext;
		event: import('@netlify/functions').HandlerEvent;
	}
}

describe('match', () => {
	it('returns a handler function', async () => {
		const handler = match('GET', '/path', async () => {
			return { statusCode: 200 };
		});

		expect(handler).toBeInstanceOf(Function);
	});

	describe('handler', () => {
		const handler = match('GET', '/path', async () => {
			return { statusCode: 200 };
		});

		beforeEach((context) => {
			context.event = {
				body: null,
				headers: {},
				httpMethod: 'GET',
				isBase64Encoded: false,
				multiValueHeaders: {},
				multiValueQueryStringParameters: {},
				netlifyGraphToken: undefined,
				path: '/path',
				queryStringParameters: {},
				rawQuery: '',
				rawUrl: 'http://localhost:9999/.netlify/functions/path',
			};
		});

		it('handles matching requests', async ({ event, context }) => {
			const result = await handler(event, context);

			expect(result).toMatchObject({ statusCode: 200 });
		});

		it('rejects non-matching requests', async ({ event, context }) => {
			const wrongMethod = await handler(
				{ ...event, httpMethod: 'POST' },
				context
			);
			const wrongPath = await handler(
				{ ...event, path: '/wrong/path' },
				context
			);

			expect(wrongMethod).toMatchObject({ statusCode: 400 });
			expect(wrongPath).toMatchObject({ statusCode: 404 });
		});
	});
});
