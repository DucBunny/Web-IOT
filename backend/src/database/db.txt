Table products {
  id int [pk, increment]
  name_vi varchar(255) [not null]
  name_en varchar(255) [not null]
  price_per_kg int [not null]
  img_url varchar(255) 
}

Table orders {
  id int [pk, increment]
  total_amount int [not null]
  status varchar(50) 
  checkout_at timestamp [default: `null`]
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: `null`]
}

Table order_items {
  id int [pk, increment]
  order_id int [not null]
  product_id int [not null]
  quantity_gram int [not null]
  price_per_kg_at_purchase int [not null]
  subtotal int [not null]
}

Ref: orders.id < order_items.order_id 
Ref: products.id < order_items.product_id 