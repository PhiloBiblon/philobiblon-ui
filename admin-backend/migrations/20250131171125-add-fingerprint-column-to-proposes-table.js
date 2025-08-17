module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('proposes', 'fingerprint', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn('proposes', 'claim_id');
    await queryInterface.removeColumn('proposes', 'from');
    await queryInterface.removeColumn('proposes', 'to');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('proposes', 'fingerprint');

    await queryInterface.addColumn('proposes', 'claim_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('proposes', 'from', {
      type: Sequelize.JSON,
      allowNull: false,
    });
    await queryInterface.addColumn('proposes', 'to', {
      type: Sequelize.JSON,
      allowNull: false,
    });
  }
};
