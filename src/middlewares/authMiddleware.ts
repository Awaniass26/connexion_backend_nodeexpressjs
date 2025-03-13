import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Accès refusé, token manquant" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string | { name: string } };

        const role = typeof decoded.role === "object" && "name" in decoded.role ? decoded.role.name : decoded.role;

        (req as AuthRequest).user = { id: decoded.id, role }; 

        next();
    } catch (error) {
        res.status(400).json({ message: "Token invalide" });
    }
};


export const roleMiddleware = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthRequest).user;
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ message: "Accès interdit" });
            return
        }
        next();
    };
};
