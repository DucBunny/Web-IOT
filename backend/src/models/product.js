'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
      })
    }
  }
  Product.init(
    {
      name_vi: { type: DataTypes.STRING(255), allowNull: false },
      name_en: { type: DataTypes.STRING(255), allowNull: false },
      price_per_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      img_url: { type: DataTypes.STRING(255), allowNull: true }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      underscored: true
    }
  )
  return Product
}
