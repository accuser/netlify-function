import type { Handler } from '@netlify/functions';
import cookie from 'cookie';
import { parse, type RouteParams } from 'regexparam';
import array from './array.js';
import pluck from './pluck.js';

const match = <T extends string>(
	method: HTTPMethod | HTTPMethod[],
	path: T,
	handler: RouteHandler<T>
) => {
	const matcher = parse(path);

	return (async (event, context) => {
		if (!array(method).includes(event.httpMethod as HTTPMethod)) {
			return { statusCode: 400 };
		}

		if (!matcher.pattern.test(event.path)) {
			return { statusCode: 404 };
		}

		const headers = new Headers(event.headers as Record<string, string>);
		const cookies = cookie.parse(headers.get('cookie') ?? '');
		const params = pluck<RouteParams<T>>(event.path, matcher);
		const url = new URL(event.rawUrl);

		const request = new Request(url, {
			body: ['DELETE', 'GET', 'HEAD'].includes(event.httpMethod)
				? undefined
				: event.body,
			headers: new Headers(event.headers as Record<string, string>),
			method: event.httpMethod,
		});

		const response = await handler({
			cookies,
			fetch,
			params,
			raw: { context, event },
			request,
			url,
		});

		if (event.httpMethod === 'HEAD') {
			return { ...response, body: undefined };
		} else {
			return response;
		}
	}) as Handler;
};

export default match;
