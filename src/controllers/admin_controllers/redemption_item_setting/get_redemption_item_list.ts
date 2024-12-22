// src/controllers/redemption_item_setting/get_redemption_item_list.ts

// import { pool } from "../../db";
import type { Pool, PoolClient } from "pg";
import { getTenantClient } from "../../db";
import { type Context } from "hono";

interface RedemptionItem {
  redemption_item_id: number;
  created_at: string;
  redemption_item_name: string;
  redemption_type: "fixed_amount" | "percentage";
  redeem_point: number;
  discount_amount?: number; // For fixed amount discount
  discount_percentage?: number; // For percentage discount
  fixed_discount_cap?: number; // For percentage discount
  minimum_spending: number;
  validity_period: number;
  redemption_item_status: "expired" | "active" | "suspended" | "scheduled";
  valid_from?: string;
  valid_until?: string;
}

// Date formatting function
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are zero-based
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to get allowed enum values from the database
async function getEnumValues(enumName: string, pool: PoolClient): Promise<string[]> {
  const query = `
    SELECT enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = $1
    ORDER BY e.enumsortorder
  `;
  const { rows } = await pool.query(query, [enumName]);
  return rows.map((row) => row.enum_value);
}

async function getRedemptionItemList(c: Context): Promise<{
  
  redemption_items: RedemptionItem[];
  redemption_types: string[];
  redemption_item_status: string[];
  active_count: number;
  scheduled_count: number;

}> {

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    // Query the database to get all redemption items
    const query = `
      SELECT
        redemption_item_id,
        redemption_item_name,
        redemption_type,
        redeem_point,
        discount_amount,
        fixed_discount_cap,
        minimum_spending,
        validity_period,
        redemption_item_status,
        created_at,
        valid_from,
        valid_until
      FROM redemption_item
      WHERE deleted_status IS NOT TRUE
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query);

    // Initialize counters for 'active' and 'scheduled' statuses
    let activeCount = 0;
    let scheduledCount = 0;

    // Map the results to the RedemptionItem interface
    const redemptionItems: RedemptionItem[] = rows.map((row) => {
      // Depending on 'redemption_type', map 'discount_amount' appropriately
      let discountAmount: number | undefined = undefined;
      let discountPercentage: number | undefined = undefined;
      let fixedDiscountCap: number | undefined = undefined;

      if (row.redemption_type === "fixed_amount") {
        discountAmount =
          row.discount_amount !== null
            ? Number(row.discount_amount)
            : undefined;
      } else if (row.redemption_type === "percentage") {
        discountPercentage =
          row.discount_amount !== null
            ? Number(row.discount_amount)
            : undefined;
        fixedDiscountCap =
          row.fixed_discount_cap !== null
            ? Number(row.fixed_discount_cap)
            : undefined;
      }

      // Increment counters based on redemption_item_status
      if (row.redemption_item_status === "active") {
        activeCount++;
      } else if (row.redemption_item_status === "scheduled") {
        scheduledCount++;
      }

      const redemptionItem: RedemptionItem = {
        redemption_item_id: row.redemption_item_id,
        created_at: row.created_at ? row.created_at.toISOString() : "",
        redemption_item_name: row.redemption_item_name,
        redemption_type: row.redemption_type,
        redeem_point: row.redeem_point,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        fixed_discount_cap: fixedDiscountCap,
        minimum_spending:
          row.minimum_spending !== null ? Number(row.minimum_spending) : 0,
        validity_period: row.validity_period,
        redemption_item_status: row.redemption_item_status,
        valid_from: row.valid_from ? formatDate(new Date(row.valid_from)) : undefined,
        valid_until: row.valid_until ? formatDate(new Date(row.valid_until)) : undefined,
      };

      return redemptionItem;
    });

    // Get allowed options from the database enums
    const redemptionTypes = await getEnumValues('redemption_type_enum', pool);
    const statusOptions = await getEnumValues('redemption_item_status_enum', pool);

    return {
      redemption_items: redemptionItems,
      redemption_types: redemptionTypes,
      redemption_item_status: statusOptions,
      active_count: activeCount,
      scheduled_count: scheduledCount,
    };
  } catch (error) {
    console.error("Error fetching redemption items:", error);
    throw new Error("Internal Server Error");
  } finally {
    pool.release();
  }
}

export default getRedemptionItemList;