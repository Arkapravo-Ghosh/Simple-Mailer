import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("[authMiddleware] API_KEY not set — skipping auth check");
    return next();
  }

  const headerKey = (req.header("x-api-key") || "").trim();
  const authHeader = (req.header("authorization") || "").trim();
  let bearerKey = "";
  if (authHeader.toLowerCase().startsWith("bearer ")) bearerKey = authHeader.slice(7).trim();

  const provided = headerKey || bearerKey || req.query.api_key || "";

  if (!provided || provided !== apiKey) {
    return res.status(401).json({ error: "Unauthorized: invalid API key" });
  }

  return next();
};

export default authMiddleware;
