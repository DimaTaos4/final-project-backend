import { Request, Response } from "express";

const notFoundHadler = (req: Request, res: Response) => {
  res.status(404).json({
    message: `${req.url} not found`,
  });
};
export default notFoundHadler;
