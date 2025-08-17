'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('proposes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      claim_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      to: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('proposes');
  },
};
