import mongoose from "mongoose";

export interface IRendezVous extends mongoose.Document {
    patient: mongoose.Types.ObjectId;
    medecin?: mongoose.Types.ObjectId;
    date: Date;
    statut: "en_attente" | "confirmé" | "annulé";
    createdAt: Date;
}

const RendezVousSchema = new mongoose.Schema<IRendezVous>({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medecin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    statut: { type: String, enum: ["en_attente", "confirmé", "annulé"], default: "en_attente" },
    createdAt: { type: Date, default: Date.now }
});

const RendezVous = mongoose.model<IRendezVous>("RendezVous", RendezVousSchema);
export default RendezVous;
