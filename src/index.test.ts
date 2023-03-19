import { beforeEach, describe, expect, it } from 'vitest';
import { GET } from './index.js';

declare module 'vitest' {
	export interface TestContext {
		context: import('@netlify/functions').HandlerContext;
		event: import('@netlify/functions').HandlerEvent;
	}
}

describe('index', () => {
	it('exports GET', async () => {
		expect(GET).toBeInstanceOf(Function);
	});

	describe('GET', () => {
		it('returns a handler function', async () => {
			const handler = GET('/path', async () => {
				return { statusCode: 200 };
			});

			expect(handler).toBeInstanceOf(Function);
		});

		describe('handler', () => {
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

			it('handles GET requests to the correct path', async ({
				event,
				context,
			}) => {
				const result = await GET('/path', async () => {
					return { statusCode: 200 };
				})(event, context);

				expect(result).toMatchObject({
					statusCode: 200,
				});
			});

			it('rejects non GET requests to the correct path', async ({
				event,
				context,
			}) => {
				const result = await GET('/path', async () => {
					return { statusCode: 200 };
				})({ ...event, httpMethod: 'POST' }, context);

				expect(result).toMatchObject({
					statusCode: 400,
				});
			});

			it('rejects GET requests to the correct path', async ({
				event,
				context,
			}) => {
				const result = await GET('/wrong', async () => {
					return { statusCode: 200 };
				})(event, context);

				expect(result).toMatchObject({
					statusCode: 404,
				});
			});
		});
	});
});
