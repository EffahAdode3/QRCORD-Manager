import { Sequelize } from "sequelize";
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite", // This file will be created in your project root
    logging: false
});
export default sequelize;