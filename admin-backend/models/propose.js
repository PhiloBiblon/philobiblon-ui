'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user')
const Propose = sequelize.define('Propose', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    item_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isString(value) {
                if (typeof value !== 'string') {
                    throw new Error('item_id must be a string');
                }
            },
        },
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    fingerprint: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'proposes',
    timestamps: true,
    paranoid: true,
    validate: {
        isValidFields() {
            if (!this.fingerprint || !this.item_id) {
                throw new Error('fingerprint, item id');
            }
        }
    }
});
Propose.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Propose