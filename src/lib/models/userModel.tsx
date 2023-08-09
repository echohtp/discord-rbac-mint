// const sequelize = require('../database');

import { Model, DataTypes, Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.DB!, {
        dialect: "postgres",
        dialectModule: require('pg'),
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    })

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    solanaPublicKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    membershipNFTPublicKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    registrationKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    roles: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nftId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: false,
});


export default User;
