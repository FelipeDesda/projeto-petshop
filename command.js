import chalk from "chalk";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import initRelations from "./database/relations.js";
import sequelize from "./database/connections/sequelize.js";
import UserModel from "./app/Models/UserModel.js";

dotenv.config({ quiet: true });

process.env.JWT_SECRET = process.env.JWT_SECRET || "petshop-dev-secret";
process.env.NODE_WEB_PORT = process.env.NODE_WEB_PORT || "3000";

const command = process.argv[2];

async function migrate() {
    initRelations();

    for (let attempt = 1; attempt <= 20; attempt++) {
        try {
            await sequelize.authenticate();
            break;
        } catch (error) {
            if (attempt === 20) {
                throw error;
            }

            console.log(chalk.yellow(`Aguardando PostgreSQL... tentativa ${attempt}/20`));
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    }

    await sequelize.sync({ alter: true });

    const adminEmail = process.env.ADMIN_EMAIL || "admin@petshop.local";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const [admin, created] = await UserModel.findOrCreate({
        where: {
            email: adminEmail
        },
        defaults: {
            name: "Administrador PetShop",
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, 10),
            phone: "00000000000",
            role: "admin"
        }
    });

    if (!created && !admin.password) {
        admin.password = await bcrypt.hash(adminPassword, 10);
        admin.role = "admin";
        await admin.save();
    }

    if (!created && admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
    }

    console.log(chalk.green("Migrations executadas com sucesso."));
    console.log(chalk.blue(`Usuário inicial: ${adminEmail}`));
}

async function main() {
    if (command === "migrate") {
        await migrate();
        return;
    }

    console.log("Comandos disponíveis:");
    console.log("  node command.js migrate");
}

try {
    await main();
    await sequelize.close();
} catch (error) {
    console.error(error);
    await sequelize.close();
    process.exit(1);
}
