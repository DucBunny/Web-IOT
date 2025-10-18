'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_vi: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      price_per_kg: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      img_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        )
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products')
  }
}
