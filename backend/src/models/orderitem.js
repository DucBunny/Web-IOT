'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      })
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      })
    }
  }
  OrderItem.init(
    {
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity_gram: { type: DataTypes.INTEGER, allowNull: false },
      price_per_kg_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_item',
      underscored: true
    }
  )
  return OrderItem
}
