type RouteHandler<T extends string> = (event: {
	cookies: Record<string, string>;
	fetch: typeof fetch;
	params: import('regexparam').RouteParams<T>;
	raw: {
		context: import('@netlify/functions').HandlerContext;
		event: import('@netlify/functions').HandlerEvent;
	};
	request: Request;
	url: URL;
}) => Promise<import('@netlify/functions').HandlerResponse>;
