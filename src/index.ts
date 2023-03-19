import type {
	Handler,
	HandlerContext,
	HandlerEvent,
	HandlerResponse,
} from '@netlify/functions';
import cookie from 'cookie';
import { parse, type RouteParams } from 'regexparam';

type HTTPMethod =
	| 'DELETE'
	| 'GET'
	| 'HEAD'
	| 'OPTIONS'
	| 'PATCH'
	| 'POST'
	| 'PUT';

export type RouteHandler<T extends string> = (event: {
	cookies: Record<string, string>;
	fetch: typeof fetch;
	params: RouteParams<T>;
	raw: {
		context: HandlerContext;
		event: HandlerEvent;
	};
	request: Request;
	url: URL;
}) => Promise<HandlerResponse>;

const array = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

const pluck = ((path, { keys, pattern }) => {
	const result = pattern.exec(path) ?? [];

	return keys.reduce((p, c, i) => ({ ...p, [c]: result[i + 1] }), {});
}) as <T>(path: string, matcher: { keys: string[]; pattern: RegExp }) => T;

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

export const DELETE = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['DELETE'], path, handler);

export const GET = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['GET', 'HEAD'], path, handler);

export const HEAD = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['HEAD'], path, handler);

export const OPTIONS = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['OPTIONS'], path, handler);

export const PATCH = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['PATCH'], path, handler);

export const POST = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['POST'], path, handler);

export const PUT = <T extends string>(path: T, handler: RouteHandler<T>) =>
	match(['PUT'], path, handler);

export default match;
