import { pool } from "../db";
import type { Context } from "hono";
import getTenantLoginAvailability from "./get_tenant_login_availability";
import postTenantCreateNewTenantLoginRecord from "./post_tenant_create_new_tenant_login_record";

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO = process.env.RAILWAY_REPO;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

async function postTenantCreateNewService1(c: Context): Promise<Response> {
  console.log("postTenantCreateNewService function begin");

  // Step 1: Create a new tenant login record
  const newTenantRecord = await postTenantCreateNewTenantLoginRecord(c);

  // Step 2: Get tenant login availability
  const availability = await getTenantLoginAvailability(c);

  console.log("availability", availability);

  // Step 3: Select the first available tenant login record
  const availableTenant = availability.find(
    (tenant) => !tenant.used && !tenant.service_created
  );

  if (!availableTenant) {
    return c.json(
      { message: "No available tenant login records for service creation." },
      400
    );
  }

  console.log("Selected tenant for service creation:", availableTenant);

  // Step 4: Prepare GraphQL mutation payload
  const graphqlQuery = {
    query: `
      mutation serviceCreate($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          __typename
          createdAt
          deletedAt
          icon
          id
          name
          projectId
          templateThreadSlug
          updatedAt
        }
      }
    `,
    variables: {
      input: {
        source: {
          repo: RAILWAY_REPO,
        },
        projectId: RAILWAY_PROJECT_ID,
      },
    },
  };

  // Step 5: Perform the GraphQL request to Railway
  try {
    const response = await fetch(RAILWAY_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: RAILWAY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", data);
      return c.json(
        { message: "Failed to create service on Railway.", details: data },
        500
      );
    }

    console.log("Service creation response:", data);

    // Step 6: Update the tenant login record to mark the service as created
    const { tenant_login_id } = availableTenant;
    const client = await pool.connect();

    try {
      await client.query(
        `
        UPDATE system_schema.system_tenant_login
        SET service_created = true
        WHERE tenant_login_id = $1
      `,
        [tenant_login_id]
      );

      console.log(
        `Tenant login record with ID ${tenant_login_id} marked as service created.`
      );
    } catch (err) {
      console.error("Error updating tenant login record:", err);
      throw err;
    } finally {
      client.release();
    }

    // Step 7: Return success response
    return c.json({
      message: "Service created successfully on Railway.",
      railwayResponse: data,
    });
  } catch (err) {
    console.error("Error in postTenantCreateNewService:", err);
    return c.json(
      { message: "An error occurred while creating the service.", error: err },
      500
    );
  }
}

export default postTenantCreateNewService1;