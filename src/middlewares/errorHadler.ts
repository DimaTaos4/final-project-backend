import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { status = 500, message = "Internal Server Error" } = error;
  res.status(status).json({ message });
};

export default errorHandler;
