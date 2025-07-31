import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../utils/HttpExeption";

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined in .env");
}

interface JwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpException(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId; 
    next();
  } catch (error) {
    next(new HttpException(401, "Unauthorized: Invalid or expired token"));
  }
};

export default authMiddleware;
