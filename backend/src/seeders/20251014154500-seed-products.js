'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date()
    return queryInterface.bulkInsert(
      'Products',
      [
        {
          name_en: 'Apple',
          name_vi: 'Táo',
          price_per_kg: 100000,
          img_url: 'apple.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Bell Pepper',
          name_vi: 'Ớt chuông',
          price_per_kg: 50000,
          img_url: 'bell_pepper.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Carrot',
          name_vi: 'Cà rốt',
          price_per_kg: 20000,
          img_url: 'carrot.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Cucumber',
          name_vi: 'Dưa leo',
          price_per_kg: 25000,
          img_url: 'cucumber.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Custard Apple',
          name_vi: 'Na',
          price_per_kg: 60000,
          img_url: 'custard_apple.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Green Guava',
          name_vi: 'Ổi xanh',
          price_per_kg: 30000,
          img_url: 'green_guava.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Mango',
          name_vi: 'Xoài',
          price_per_kg: 50000,
          img_url: 'mango.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Pear',
          name_vi: 'Lê',
          price_per_kg: 80000,
          img_url: 'pear.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Tomato',
          name_vi: 'Cà chua',
          price_per_kg: 30000,
          img_url: 'tomato.png',
          created_at: now,
          updated_at: now
        },
        {
          name_en: 'Wax Apple',
          name_vi: 'Roi',
          price_per_kg: 35000,
          img_url: 'wax_apple.png',
          created_at: now,
          updated_at: now
        }
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
