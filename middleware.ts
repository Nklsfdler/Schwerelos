import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIMARY_DOMAIN = 'schwerelos.art';

const REDIRECT_DOMAINS = [
    'schwerelos.vercel.app',
    'schwerelossemant.vercel.app',
    'www.schwerelos.art',
];

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';

    if (REDIRECT_DOMAINS.some(d => host.includes(d))) {
        const url = new URL(request.url);
        url.hostname = PRIMARY_DOMAIN;
        url.protocol = 'https';
        url.port = '';
        return NextResponse.redirect(url, 308);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
