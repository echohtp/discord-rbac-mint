// lib/database.js
import { Sequelize } from 'sequelize'

const initializeDatabase = () => {

    // FIX - this isnt used, use the one in the userModel
    const sequelize = new Sequelize("", {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    })
    return sequelize
}

export default initializeDatabase;
