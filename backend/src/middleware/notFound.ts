import { Request, Response } from "express";

const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `${req.originalUrl} manzili topilmadi`,
      code: "404",
    },
  });
};

export default notFound;
