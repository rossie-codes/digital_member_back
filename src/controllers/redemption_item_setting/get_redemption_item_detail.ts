// src/controllers/redemption_item_setting/get_redemption_item_detail.ts

import { pool } from '../db';
import type { Context } from 'hono';

interface RedemptionItem {
  created_at: string;
  redemption_item_id: number;
  redemption_item_name: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_amount?: number; // For fixed amount discount
  discount_percentage?: number; // For percentage discount
  fixed_discount_cap?: number; // For percentage discount
  minimum_spending: number;
  validity_period: number;
  is_active: boolean;
}

async function getRedemptionItemDetail(redemption_item_id: string): Promise<RedemptionItem> {
  try {
    // Query the database to get the specific redemption item
    const query = `
      SELECT
        redemption_item_id,
        redemption_item_name,
        discount_type,
        discount_amount,
        fixed_discount_cap,
        minimum_spending,
        validity_period,
        is_active,
        created_at
      FROM redemption_item
      WHERE redemption_item_id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [redemption_item_id]);

    if (rows.length === 0) {
      throw new Error('Redemption item not found');
    }

    const row = rows[0];

    // Map 'is_active' to 'is_active'
    const isActive = row.is_active === 'True';

    // Depending on 'discount_type', map 'discount_amount' appropriately
    let discountAmount: number | undefined = undefined;
    let discountPercentage: number | undefined = undefined;
    let fixedDiscountCap: number | undefined = undefined;

    if (row.discount_type === 'fixed_amount') {
      discountAmount = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
    } else if (row.discount_type === 'percentage') {
      discountPercentage = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
      fixedDiscountCap = row.fixed_discount_cap !== null ? Number(row.fixed_discount_cap) : undefined;
    }

    const redemptionItem: RedemptionItem = {
      redemption_item_id: row.redemption_item_id,
      created_at: row.created_at ? row.created_at.toISOString() : '',
      redemption_item_name: row.redemption_item_name,
      discount_type: row.discount_type,
      discount_amount: discountAmount,
      discount_percentage: discountPercentage,
      fixed_discount_cap: fixedDiscountCap,
      minimum_spending: row.minimum_spending !== null ? Number(row.minimum_spending) : 0,
      validity_period: row.validity_period,
      is_active: isActive,
    };

    console.log(redemptionItem)
    // Return the redemption item
    return redemptionItem;

  } catch (error) {
    console.error('Error fetching redemption item:', error);
    throw error;
  }
}

export default getRedemptionItemDetail;