// src/controllers/redemption_item_setting/get_deleted_redemption_item_list.ts

import { pool } from "../db";
import { type Context } from "hono";

interface RedemptionItem {
    redemption_item_id: number;
    created_at: string;
    redemption_name: string;
    discount_type: "fixed_amount" | "percentage";
    discount_amount?: number; // For fixed amount discount
    discount_percentage?: number; // For percentage discount
    fixed_discount_cap?: number; // For percentage discount
    minimum_spending: number;
    validity_period: number;
    is_active: boolean;
}

async function getDeletedRedemptionItemList(c: Context): Promise<RedemptionItem[]> {
    try {
        // Query the database to get all redemption items
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
      WHERE deleted_status IS TRUE  -- Add this WHERE clause
      ORDER BY created_at DESC
    `;

        const { rows } = await pool.query(query);

        // Map the results to the RedemptionItem interface
        const redemptionItems: RedemptionItem[] = rows.map((row) => {
            // Map 'status' to 'is_active'
            const isActive = row.is_active === "true";

            // Depending on 'discount_type', map 'discount_amount' appropriately
            let discountAmount: number | undefined = undefined;
            let discountPercentage: number | undefined = undefined;
            let fixedDiscountCap: number | undefined = undefined;

            if (row.discount_type === "fixed_amount") {
                discountAmount =
                    row.discount_amount !== null
                        ? Number(row.discount_amount)
                        : undefined;
            } else if (row.discount_type === "percentage") {
                discountPercentage =
                    row.discount_amount !== null
                        ? Number(row.discount_amount)
                        : undefined;
                fixedDiscountCap =
                    row.fixed_discount_cap !== null
                        ? Number(row.fixed_discount_cap)
                        : undefined;
            }

            const redemptionItem: RedemptionItem = {
                redemption_item_id: row.redemption_item_id,
                created_at: row.created_at ? row.created_at.toISOString() : "",
                redemption_name: row.redemption_item_name,
                discount_type: row.discount_type,
                discount_amount: discountAmount,
                discount_percentage: discountPercentage,
                fixed_discount_cap: fixedDiscountCap,
                minimum_spending:
                    row.minimum_spending !== null ? Number(row.minimum_spending) : 0,
                validity_period: row.validity_period,
                is_active: isActive,
            };

            return redemptionItem;
        });

        // Return the data as a JSON response
        return redemptionItems;
    } catch (error) {
        console.error("Error fetching redemption items:", error);
        // Return an error response
        throw new Error("Internal Server Error");
    }
}

export default getDeletedRedemptionItemList;
