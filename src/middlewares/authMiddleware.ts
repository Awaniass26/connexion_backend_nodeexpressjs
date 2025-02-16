import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

dotenv.config();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Accès refusé" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Token invalide" });
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès interdit" });
        }
        next();
    };
};
