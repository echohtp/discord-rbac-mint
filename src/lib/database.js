// lib/database.js
import { Sequelize } from 'sequelize'
var pg = require('pg');

const initializeDatabase = () => {

    // FIX - this isnt used, use the one in the userModel
    const sequelize = new Sequelize("", {
        dialect: "postgres",
        dialectModule: pg,
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
