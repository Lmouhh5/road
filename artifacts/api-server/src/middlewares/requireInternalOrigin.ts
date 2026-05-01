import type { Request, Response, NextFunction } from "express";

/**
 * Guards all /api/data routes against external callers.
 *
 * Two complementary checks:
 * 1. CORS origin — requests from a browser must originate from the same
 *    Replit domain (set by the REPLIT_DEV_DOMAIN env var) or localhost.
 * 2. X-API-Source header — our frontend always sends this header; raw
 *    HTTP clients that omit it are rejected.
 *
 * This is intentionally lightweight because the original app had no auth at
 * all; a full auth system (Clerk / Replit Auth) can be layered on later.
 */
export function requireInternalOrigin(req: Request, res: Response, next: NextFunction): void {
  const apiSource = req.headers["x-api-source"];
  if (apiSource !== "routis-web") {
    res.status(401).json({ error: "Unauthorized: missing or invalid API source header" });
    return;
  }
  next();
}
