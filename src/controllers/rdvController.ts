import { NextFunction, Request, Response } from "express";
import RendezVous from "../models/RendezVous";
import User from "../models/User";
import mongoose from "mongoose";


interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}


export const getRendezVousMedecin = async (req: AuthRequest, res: Response) => {
    try {
        const medecinId = req.user?.id;
        const rendezVous = await RendezVous.find({ medecin: medecinId }).populate("patient", "username email");
        res.status(200).json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const gererRendezVous = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const { rdvId, action } = req.body;
        const medecinId = req.user?.id;

        const rdv = await RendezVous.findById(rdvId);
        if (!rdv || rdv.medecin?.toString() !== medecinId) {
           res.status(403).json({ message: "Accès interdit" });
            return;
        }

        rdv.statut = action === "confirmer" ? "confirmé" : "annulé";
        await rdv.save();

        res.status(200).json({ message: `Rendez-vous ${rdv.statut}` });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const demanderRendezVous = async (req: AuthRequest, res: Response ,next: NextFunction): Promise<void> => {
    try {
        const { date } = req.body;
        const patientId = req.user?.id;

        if (!date) {
            res.status(400).json({ message: "Veuillez fournir une date" });
            return;
        }
        if (!patientId) {
            res.status(400).json({ message: "Utilisateur non trouvé" });
            return;
        }

        const rdv = new RendezVous({ patient: patientId, date, statut: "en_attente" });
        await rdv.save();

        res.status(201).json({ message: "Demande envoyée", rdv });
    } catch (error) {
        next(error);
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
        next(error);
    }
};

export const creerRendezVous = async (req: Request, res: Response , next: NextFunction): Promise<void> => {
    try {
        const { patientId, date } = req.body;

        if (!patientId || !date) {
            res.status(400).json({ message: "Veuillez fournir un patientId et une date" });
            return;
        }

        const rdv = new RendezVous({ patient: patientId, date });
        await rdv.save();

        res.status(201).json({ message: "Rendez-vous créé avec succès", rdv });
    } catch (error) {
        next(error);
    }
};


export const assignerMedecin = async (req: Request, res: Response, next:NextFunction) : Promise <void> => {
    try {
        const { rdvId, medecinId } = req.body;

        if (!rdvId || !medecinId) {
            res.status(400).json({ message: "Veuillez fournir un rdvId et un medecinId" });
            return;
        }

        const rdv = await RendezVous.findById(rdvId);
        if (!rdv) {
            res.status(404).json({ message: "Rendez-vous non trouvé" });
            return;
        }

        const medecin = await User.findById(new mongoose.Types.ObjectId(medecinId));
        if (!medecin || medecin.role.toString() !== "Medecin") {
            res.status(404).json({ message: "Médecin introuvable" });
            return;
        }

        rdv.medecin = medecinId;
        await rdv.save();

        res.status(200).json({ message: "Médecin assigné au rendez-vous", rdv });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};