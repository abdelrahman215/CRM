const db = require('../config/db');

async function listBySalesUser(salesUserId, { q, propertyType }) {
  const conditions = ['sales_user_id = $1'];
  const params = [salesUserId];
  let paramIndex = params.length;

  if (q) {
    paramIndex += 1;
    conditions.push(
      `(LOWER(full_name) LIKE $${paramIndex} OR LOWER(phone) LIKE $${paramIndex} OR LOWER(location) LIKE $${paramIndex})`
    );
    params.push(`%${q.toLowerCase()}%`);
  }

  if (propertyType) {
    paramIndex += 1;
    conditions.push(`property_type = $${paramIndex}`);
    params.push(propertyType);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `
    SELECT id, sales_user_id, full_name, property_type, property_details, phone, location, notes, created_at, updated_at
    FROM client_records
    ${whereClause}
    ORDER BY updated_at DESC, created_at DESC
    `,
    params
  );

  return rows;
}

async function createForSalesUser(salesUserId, payload) {
  const { rows } = await db.query(
    `
    INSERT INTO client_records
      (sales_user_id, full_name, property_type, property_details, phone, location, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, sales_user_id, full_name, property_type, property_details, phone, location, notes, created_at, updated_at
    `,
    [
      salesUserId,
      payload.full_name,
      payload.property_type,
      payload.property_details || null,
      payload.phone,
      payload.location,
      payload.notes || null
    ]
  );

  return rows[0];
}

async function findByIdForSalesUser(id, salesUserId) {
  const { rows } = await db.query(
    `
    SELECT id, sales_user_id, full_name, property_type, property_details, phone, location, notes, created_at, updated_at
    FROM client_records
    WHERE id = $1 AND sales_user_id = $2
    `,
    [id, salesUserId]
  );
  return rows[0] || null;
}

async function updateForSalesUser(id, salesUserId, payload) {
  const { rows } = await db.query(
    `
    UPDATE client_records
    SET full_name = $1,
        property_type = $2,
        property_details = $3,
        phone = $4,
        location = $5,
        notes = $6,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 AND sales_user_id = $8
    RETURNING id, sales_user_id, full_name, property_type, property_details, phone, location, notes, created_at, updated_at
    `,
    [
      payload.full_name,
      payload.property_type,
      payload.property_details || null,
      payload.phone,
      payload.location,
      payload.notes || null,
      id,
      salesUserId
    ]
  );

  return rows[0] || null;
}

async function deleteForSalesUser(id, salesUserId) {
  await db.query('DELETE FROM client_records WHERE id = $1 AND sales_user_id = $2', [id, salesUserId]);
}

module.exports = {
  listBySalesUser,
  createForSalesUser,
  findByIdForSalesUser,
  updateForSalesUser,
  deleteForSalesUser
};

