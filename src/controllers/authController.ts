import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();    

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            res.status(400).json({ message: "Tous les champs sont obligatoires" });
            return;
        }

        const validRoles = ["Medecin", "Patient", "Secretaire"];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: "Rôle invalide. Choisissez parmi : Medecin, Patient, Secretaire" });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Cet utilisateur existe déjà" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: "Utilisateur créé avec succès", user });

    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        next(error); 
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Utilisateur non trouvé" });
            return; 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Mot de passe incorrect" });
            return;
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
        
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};