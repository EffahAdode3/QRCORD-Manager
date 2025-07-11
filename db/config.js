import { Sequelize } from "sequelize";
import Database from 'better-sqlite3';

const sequelize = new Sequelize({
    dialect: "sqlite",
    dialectModule: Database,
    storage: "./database.sqlite", // This file will be created in your project root
    logging: false
});
export default sequelize;