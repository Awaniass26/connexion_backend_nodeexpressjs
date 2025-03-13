import Role from "../models/Role";

export const dRoles = async () => {
    const roles = ["Medecin", "Patient", "Secretaire"];

    for (const roleName of roles) {
        const existingRole = await Role.findOne({ name: roleName });
        if (!existingRole) {
            await new Role({ name: roleName }).save();
            console.log(`Rôle ajouté : ${roleName}`);
        }
    }
};
