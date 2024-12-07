import { pool } from "../controllers/db";
import postWatiBroadcast from "./post_wati_broadcast";

interface BroadcastData {
  broadcast_id: number;
  broadcast_name: string;
  wati_template: string; // Changed from wati_template_id to match schema
  broadcast_now: boolean;
  scheduled_start: Date;
  wati_account: string;
  wati_number: string;
  members: ReceiverData[];
}

interface ReceiverData {
  broadcast_history_id: number;
  broadcast_id: number;
  member_id: number;
  broadcast_history_status: string;
  member_phone: string; // Added to store phone number from member table
}

async function checkAndProcessBroadcasts() {
  console.log("Checking broadcasts..."); // Debug log

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get pending broadcasts that are scheduled to run
    const getBroadcastsQuery = `
      SELECT 
        broadcast_id,
        broadcast_name,
        wati_template,
        broadcast_now,
        scheduled_start,
        wati_account,
        wati_number
      FROM public.broadcast
      WHERE broadcast_now = false 
      AND scheduled_start <= CURRENT_TIMESTAMP
      AND broadcast_status <> 'all_done'
      FOR UPDATE;  -- Lock these rows
    `;

    const { rows: broadcasts } = await client.query<BroadcastData>(
      getBroadcastsQuery
    );

    console.log("Found broadcasts:", broadcasts); // Debug log

    for (const broadcast of broadcasts) {
      console.log("Processing broadcast:", broadcast); // Debug log

      // Get pending receivers for this broadcast
      const getReceiversQuery = `
        SELECT 
          bh.broadcast_history_id,
          bh.broadcast_id,
          bh.member_id,
          bh.broadcast_history_status,
          m.member_phone
        FROM public.broadcast_history bh
        JOIN public.member m ON m.member_id = bh.member_id
        WHERE bh.broadcast_id = $1
        AND bh.broadcast_history_status = 'pending'
        FOR UPDATE;  -- Lock these rows
      `;

      const { rows: receivers } = await client.query<ReceiverData>(
        getReceiversQuery,
        [broadcast.broadcast_id]
      );

      console.log(
        `Found ${receivers.length} receivers for broadcast ${broadcast.broadcast_id}`
      ); // Debug log
      if (receivers.length === 0) {
        // No receivers found, update broadcast_status to 'all_done'
        console.log(
          `No receivers left for broadcast ${broadcast.broadcast_id}. Updating status to 'all_done'.`
        );

        await client.query(
          `
          UPDATE public.broadcast
          SET broadcast_status = 'all_done'
          WHERE broadcast_id = $1
        `,
          [broadcast.broadcast_id]
        );

        continue; // Skip to the next broadcast
      }

      // console.log("Found receivers:", receivers); // Debug log

      broadcast.members = receivers; // Add the receivers to the broadcast object

      console.log("Broadcast data prepared:", broadcast);

      try {
        const watiBroadcastResponse = await postWatiBroadcast(broadcast);
        console.log("WATI API response:", watiBroadcastResponse);

        // Extract invalid WhatsApp numbers from the response
        const invalidNumbers =
          watiBroadcastResponse.errors.invalidWhatsappNumbers || [];

        // Prepare a set for faster lookup
        const invalidNumbersSet = new Set(invalidNumbers);

        // Update broadcast history statuses based on the response
        for (const receiver of receivers) {
          const fullNumber = receiver.member_phone.startsWith("852")
            ? receiver.member_phone
            : `852${receiver.member_phone}`; // Adjust the number format if necessary

          if (invalidNumbersSet.has(fullNumber)) {
            // Update status to 'failed' for invalid numbers
            await client.query(
              `
            UPDATE public.broadcast_history
            SET
              broadcast_history_status = 'failed',
              updated_at = CURRENT_TIMESTAMP
            WHERE broadcast_history_id = $1
            `,
              [receiver.broadcast_history_id]
            );
            console.log(`Broadcast to ${receiver.member_phone} failed.`);
          } else {
            // Update status to 'sent' for valid numbers
            await client.query(
              `
            UPDATE public.broadcast_history
            SET
              broadcast_history_status = 'sent',
              sent_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE broadcast_history_id = $1
            `,
              [receiver.broadcast_history_id]
            );
            console.log(
              `Broadcast to ${receiver.member_phone} sent successfully.`
            );
          }
        }
      } catch (error) {
        console.error("Failed to send broadcast:", error);

        // In case of a general failure, update all receivers to 'failed'
        for (const receiver of receivers) {
          await client.query(
            `
          UPDATE public.broadcast_history
          SET
            broadcast_history_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
          WHERE broadcast_history_id = $1
          `,
            [receiver.broadcast_history_id]
          );
        }
      }

      // Update broadcast status to completed
      await client.query(
        `
        UPDATE public.broadcast
        SET broadcast_now = true
        WHERE broadcast_id = $1
      `,
        [broadcast.broadcast_id]
      );

      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in checkAndProcessBroadcasts:", error);
    throw error;
  } finally {
    client.release();
  }
}

console.log("Setting up cron job..."); // Debug log

import { CronJob } from "cron";

// Schedule the function to run every 1 minutes
const cron_broadcast = new CronJob("0 */1 * * *", async () => {
  console.log("Running cron_broadcast at", new Date().toISOString());

  try {
    const result = await checkAndProcessBroadcasts();
    console.log("Result:", result);
  } catch (error) {
    console.error("Error running cron_broadcast:", error);
  }
});

cron_broadcast.start();

export default cron_broadcast;
