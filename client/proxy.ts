import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GitHub recently started appending `iss=https://github.com/login/oauth`
 * to OAuth callback URLs. NextAuth v4 tries to validate this as an OIDC
 * issuer, fails, and throws "issuer must be configured on the issuer".
 *
 * This proxy intercepts the GitHub callback BEFORE NextAuth sees it,
 * strips the `iss` parameter via a rewrite so NextAuth gets a clean URL.
 */
export function proxy(request: NextRequest) {
    const { nextUrl } = request;

    if (
        nextUrl.pathname.startsWith("/api/auth/callback") &&
        nextUrl.searchParams.has("iss")
    ) {
        const cleanUrl = nextUrl.clone();
        cleanUrl.searchParams.delete("iss");
        return NextResponse.redirect(cleanUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/auth/callback/:path*",
};
