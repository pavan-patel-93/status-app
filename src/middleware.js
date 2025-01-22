import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (
          (req.nextUrl.pathname.startsWith("/dashboard") ||
           req.nextUrl.pathname.startsWith("/services") ||
           req.nextUrl.pathname.startsWith("/incidents")) &&
          !token
        ) {
          return false;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/services/:path*", "/incidents/:path*"],
}; 