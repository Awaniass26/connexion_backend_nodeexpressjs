import { Request, Response, NextFunction } from "express";
interface User{
    id: string;
    role: string;
}
interface AuthRequest extends Request {
    user?: User;
}
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";
import Role from "../models/Role";
import RendezVous from "../models/RendezVous";

dotenv.config();  

export const getSecretaireCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const roleData = await Role.findOne({ name: "Secretaire" });
        if (!roleData) {
            res.status(500).json({ message: "Rôle Secretaire introuvable" });
            return;
        }

        const count = await User.countDocuments({ role: roleData._id });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Erreur lors du comptage des Secrétaires :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: "Tous les champs sont obligatoires" });
            return;
        }

        if (!isValidPassword(password)) {
            res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial." });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Cet utilisateur existe déjà" });
            return;
        }

        const roleData = await Role.findOne({ name: "Secretaire" });
        if (!roleData) {
            res.status(500).json({ message: "Rôle Secretaire introuvable" });
            return;
        }

        const secretaireCount = await User.countDocuments({ role: roleData._id });
        if (secretaireCount >= 2) {
            res.status(403).json({ message: "Nombre maximum de Secrétaires atteint (2)." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: roleData._id });
        await user.save();

        res.status(201).json({ message: "Secretaire créé avec succès", user });

    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        next(error);
    }
};


export const registerUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            res.status(400).json({ message: "Tous les champs sont obligatoires" });
            return;
        }

        if (!isValidPassword(password)) {
            res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial." });
            return;
        }

        const secretaireRole = await Role.findOne({ name: "Secretaire" });
        if (!req.user || req.user.role !== secretaireRole?.name) {
            res.status(403).json({ message: "Accès interdit : Seul un Secretaire peut inscrire des utilisateurs" });
            return;
        }

        const validRole = await Role.findOne({ name: role });
        if (!validRole) {
            res.status(400).json({ message: "Rôle invalide. Choisissez parmi : Medecin, Patient" });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Cet utilisateur existe déjà" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: validRole._id });
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

        const user = await User.findOne({ email }).populate("role"); 
        if (!user) {
            res.status(400).json({ message: "Utilisateur non trouvé" });
            return; 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Mot de passe incorrect" });
            return;
        }

        if (!user.role) {
            res.status(403).json({ message: " pas de rôle" });
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

const isValidPassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().populate("role", "name");
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getRendezVousPatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const patientId = req.user?.id;

        if (!patientId) {
            res.status(400).json({ message: "Utilisateur non trouvé" });
            return;
        }

        const rendezVous = await RendezVous.find({ patient: patientId })
            .populate("medecin", "username email")
            .sort({ date: 1 }); 

        res.status(200).json(rendezVous);
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
next(error);    }
};


