'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('adminpassword', 10), // Use bcrypt for hashed passwords
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
