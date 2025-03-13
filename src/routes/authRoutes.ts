    import express from "express";
    import { register, login, registerUser, getSecretaireCount, getRendezVousPatient, getUsers} from "../controllers/authController";
    import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
    import { Response, NextFunction } from "express-serve-static-core";


    const router = express.Router();

    interface AuthRequest extends express.Request {
        user?: { id: string; role: string };
    }

    /**
     * @swagger
     * /auth/secretaires-count:
     *   get:
     *     summary: Retourne le nombre de Secrétaires existants
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Nombre de Secrétaires existants
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: number
     *                   example: 2
     *       500:
     *         description: Erreur serveur
     */
    router.get("/secretaires-count", getSecretaireCount);

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Inscription d'un utilisateur
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Utilisateur créé
     *       400:
     *         description: Erreur de validation
     */
    router.post("/register", register);


    /**
     * @swagger
     * /auth/register-user:
     *   post:
     *     summary: Inscription d'un utilisateur (Médecin ou Patient) par un Secrétaire
     *     tags: [Auth]
     *     security:
     *       - BearerAuth: []  # 👈 Ajoute cette ligne pour afficher "Authorize"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *                 enum: ["Medecin", "Patient"]
     *     responses:
     *       201:
     *         description: Utilisateur créé avec succès
     *       400:
     *         description: Erreur de validation
     *       403:
     *         description: Accès interdit (seulement pour les Secrétaires)
     *       500:
     *         description: Erreur serveur
     */
    router.post("/register-user", authMiddleware, roleMiddleware(["Secretaire"]), registerUser);


    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Connexion utilisateur
     *     tags: [Auth]
     *     security:
     *       - BearerAuth: [] 
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Connexion réussie
     *       400:
     *         description: Erreur d'authentification
     */
    router.post("/login", login);

    /**
     * @swagger
     * /auth/users:
     *   get:
     *     summary: Récupérer la liste des Médecins et Patients
     *     tags: [Auth]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Liste des utilisateurs
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   _id:
     *                     type: string
     *                   username:
     *                     type: string
     *                   email:
     *                     type: string
     *                   role:
     *                     type: string
     *       403:
     *         description: Accès interdit (seuls les Secrétaires peuvent voir la liste)
     *       500:
     *         description: Erreur serveur
     */
    router.get("/users", authMiddleware, roleMiddleware(["Secretaire"]), getUsers);
    
    /**
     * @swagger
     * /rdv/patient:
     *   get:
     *     summary: Un patient récupère la liste de ses rendez-vous
     *     tags: [RendezVous]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Liste des rendez-vous du patient
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   _id:
     *                     type: string
     *                   date:
     *                     type: string
     *                     format: date-time
     *                   statut:
     *                     type: string
     *                     enum: ["en_attente", "confirmé", "annulé"]
     *                   medecin:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                       username:
     *                         type: string
     *                       email:
     *                         type: string
     *       403:
     *         description: Accès interdit (réservé aux patients)
     *       500:
     *         description: Erreur serveur
     */
    router.get("/patient", authMiddleware, roleMiddleware(["Patient"]), getRendezVousPatient);


    export default router;



