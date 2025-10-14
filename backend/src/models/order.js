'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'orderItems'
      })
    }
  }
  Order.init(
    {
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      status: { type: DataTypes.STRING(50), allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deleted_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: false,
      underscored: true
    }
  )
  return Order
}
