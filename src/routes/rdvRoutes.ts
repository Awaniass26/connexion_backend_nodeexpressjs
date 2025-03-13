import express from "express";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { demanderRendezVous, getRendezVousMedecin, gererRendezVous, getRendezVousPatient, assignerMedecin, creerRendezVous } from "../controllers/rdvController";

const router = express.Router();


/**
 * @swagger
 * /rdv/demande:
 *   post:
 *     summary: Un patient demande un rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure du rendez-vous
 *     responses:
 *       201:
 *         description: Demande de rendez-vous enregistrée
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Accès interdit (réservé aux patients)
 *       500:
 *         description: Erreur serveur
 */
router.post("/demande", authMiddleware, roleMiddleware(["Patient"]), demanderRendezVous);

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
 *       403:
 *         description: Accès interdit (réservé aux patients)
 *       500:
 *         description: Erreur serveur
 */
router.get("/patient", authMiddleware, roleMiddleware(["Patient"]), getRendezVousPatient);

// /**
//  * @swagger
//  * /rdv/creer:
//  *   post:
//  *     summary: Créer un rendez-vous
//  *     tags: [RendezVous]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               patientId:
//  *                 type: string
//  *                 description: L'ID du patient
//  *               date:
//  *                 type: string
//  *                 format: date-time
//  *                 description: Date du rendez-vous (format ISO 8601)
//  *     responses:
//  *       201:
//  *         description: Rendez-vous créé avec succès
//  *       400:
//  *         description: Données invalides
//  *       500:
//  *         description: Erreur serveur
//  */
// router.post("/creer", authMiddleware, creerRendezVous);

/**
 * @swagger
 * /rdv/assigner:
 *   put:
 *     summary: Assigner un médecin à un rendez-vous (Secrétaire)
 *     tags: [RendezVous]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rdvId:
 *                 type: string
 *                 description: L'ID du rendez-vous
 *               medecinId:
 *                 type: string
 *                 description: L'ID du médecin
 *     responses:
 *       200:
 *         description: Rendez-vous assigné avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit (seuls les Secrétaires peuvent assigner un rendez-vous)
 *       404:
 *         description: Rendez-vous ou Médecin introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/assigner", authMiddleware, roleMiddleware(["Secretaire"]), assignerMedecin);

/**
 * @swagger
 * /rdv/medecin:
 *   get:
 *     summary: Un médecin récupère la liste de ses rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous du médecin
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
 *                   patient:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *       403:
 *         description: Accès interdit (réservé aux médecins)
 *       500:
 *         description: Erreur serveur
*/
router.get("/medecin", authMiddleware, roleMiddleware(["Medecin"]), getRendezVousMedecin);

/**
 * @swagger
 * /rdv/gerer:
 *   put:
 *     summary: Un médecin confirme ou annule un rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rdvId:
 *                 type: string
 *                 description: L'ID du rendez-vous
 *               action:
 *                 type: string
 *                 enum: ["confirmer", "annuler"]
 *                 description: Le statut du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit (réservé aux médecins)
 *       404:
 *         description: Rendez-vous introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/gerer", authMiddleware, roleMiddleware(["Medecin"]), gererRendezVous);

export default router;