import match from './match.js';

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
