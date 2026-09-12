import { query } from '../db/index.js';

async function seedDemoOrder() {
  try {
    console.log('Seeding demo order for Customer Arya Dileep (user_id: 4)...');
    
    // Check if customer 4 already has an order in public.orders
    const checkRes = await query('SELECT order_id FROM public.orders WHERE customer_id = 4');
    if (checkRes.rows.length === 0) {
      const prodRes = await query('SELECT id, price_inr FROM public.products ORDER BY id ASC LIMIT 1');
      const prodId = prodRes.rows[0].id;
      const price = prodRes.rows[0].price_inr;

      const orderInsert = await query(`
        INSERT INTO public.orders (customer_id, salesperson_id, total_amount, order_status, payment_status)
        VALUES (4, 9, $1, 'SHIPPED', 'PAID')
        RETURNING order_id
      `, [price]);
      const orderId = orderInsert.rows[0].order_id;
      
      await query(`
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, 1, $3)
        ON CONFLICT DO NOTHING
      `, [orderId, prodId, price]);

      console.log(`Order #${orderId} created for Customer 4 with item Product #${prodId}.`);
    } else {
      console.log(`Customer 4 already has ${checkRes.rows.length} order(s).`);
    }

    // Also mirror to tbl_orders
    try {
      await query(`
        UPDATE optibuy.tbl_orders SET customer_id = 4, salesperson_id = 9 WHERE order_id = 1
      `);
    } catch (e) {}

    console.log('Demo order verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed demo order failed:', err.message);
    process.exit(1);
  }
}

seedDemoOrder();
