import type {
	Handler,
	HandlerContext,
	HandlerResponse,
} from '@netlify/functions';
import cookie from 'cookie';
import { parse, type RouteParams } from 'regexparam';
import { fetch, Headers, Request } from 'undici';

type HTTPMethod =
	| 'DELETE'
	| 'GET'
	| 'HEAD'
	| 'OPTIONS'
	| 'PATCH'
	| 'POST'
	| 'PUT';

export type RequestHandler<T extends string> = (event: {
	cookies: Record<string, string>;
	fetch: typeof fetch;
	getClientAddress: () => string | undefined;
	params: RouteParams<T>;
	platform: {
		context: HandlerContext;
	};
	request: Request;
	url: URL;
}) => Promise<HandlerResponse>;

const match = <T extends string>(
	method: HTTPMethod | HTTPMethod[],
	path: T,
	handler: RequestHandler<T>
) => {
	const { keys, pattern } = parse(path);

	return (async (event, context) => {
		const { body, headers, httpMethod, isBase64Encoded, path, rawUrl } = event;
		if (![method].flat().includes(httpMethod as HTTPMethod)) {
			return { statusCode: 400 };
		}

		if (!pattern.test(path)) {
			return { statusCode: 404 };
		}

		const response = await handler({
			cookies: cookie.parse(headers['cookie'] ?? ''),
			fetch,
			getClientAddress: () => headers['x-nf-client-connection-ip'],
			params: (pattern.exec(path) ?? [])
				.slice(1, keys.length + 1)
				.reduce((p, c, i) => ({ ...p, [keys[i]]: c }), {} as RouteParams<T>),
			platform: { context },
			request: new Request(rawUrl, {
				body: ['GET', 'HEAD'].includes(httpMethod)
					? null
					: typeof body === 'string'
					? Buffer.from(body, isBase64Encoded ? 'base64' : 'utf-8')
					: body,
				headers: new Headers(headers as Record<string, string>),
				method: httpMethod,
			}),
			url: new URL(rawUrl),
		});

		return event.httpMethod === 'HEAD'
			? { ...response, body: undefined }
			: response;
	}) as Handler;
};

export const DELETE = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['DELETE'], path, handler);

export const GET = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['GET', 'HEAD'], path, handler);

export const HEAD = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['HEAD'], path, handler);

export const OPTIONS = <T extends string>(
	path: T,
	handler: RequestHandler<T>
) => match(['OPTIONS'], path, handler);

export const PATCH = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['PATCH'], path, handler);

export const POST = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['POST'], path, handler);

export const PUT = <T extends string>(path: T, handler: RequestHandler<T>) =>
	match(['PUT'], path, handler);

export default match;
