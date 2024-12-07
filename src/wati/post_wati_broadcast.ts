// src/wati/post_wati_broadcast.ts

import getWatiDetails from "../wati/wati_client";

interface BroadcastData {
  broadcast_id: number;
  broadcast_name: string;
  wati_template: string;
  broadcast_now: boolean;
  scheduled_start: Date;
  wati_account: string | null;
  wati_number: string | null;
  members: ReceiverData[];
}

interface ReceiverData {
  broadcast_history_id: number;
  broadcast_id: number;
  member_id: number;
  broadcast_history_status: string;
  member_phone: string;
}

interface WatiBroadcastData {
  template_name: string;
  broadcast_name: string;
  receivers: Receiver[];
}

interface Receiver {
  whatsappNumber: string;
  customParams?: CustomParam[];
}

interface CustomParam {
  name: string;
  value: string;
}

interface WatiBroadcastResponse {
  result: boolean;
  errors: {
    error: string;
    invalidWhatsappNumbers: string[];
    invalidCustomParameters: any[];
  };
  // Include any other properties returned by the API
}

const postWatiBroadcast = async (
  broadcast: BroadcastData
): Promise<WatiBroadcastResponse> => {
  console.log("postWatiBroadcast function begin");

  const watiDetails = await getWatiDetails();

  console.log("WATI details:", watiDetails);

  const url = `${watiDetails.wati_api_endpoint}/api/v1/sendTemplateMessages`;

  // Prepare the payload
  const payload: WatiBroadcastData = {
    template_name: broadcast.wati_template,
    broadcast_name: broadcast.broadcast_name,
    receivers: broadcast.members.map((member) => ({
      whatsappNumber: `852${member.member_phone}`,
      // Include customParams if needed
      // customParams: [
      //   { name: "1", value: "string" },
      // ],
    })),
  };

  console.log("Payload to send:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${watiDetails.wati_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `WATI API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("WATI API response:", data);

    console.log("postWatiBroadcast function end");

    return data;
  } catch (error) {
    console.error("Error in postWatiBroadcast:", error);
    throw error;
  }
};

export default postWatiBroadcast;
