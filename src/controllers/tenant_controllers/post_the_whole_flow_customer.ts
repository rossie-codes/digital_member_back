import { pool } from "../db";
import type { Context } from "hono";
import getTenantLoginAvailability from "./get_tenant_login_availability";
import postTenantCreateNewTenantLoginRecord from "./post_tenant_create_new_tenant_login_record";
import postTenantCreateNewService from "./post_tenant_create_new_service";
import postTenantChangeServiceDomain from "./post_tenant_change_service_domain";
import postTenantChangeServiceEnvVaiable from "./post_tenant_change_service_env_variable";
import postTenantServiceConnect from "./post_tenant_service_connect";
import cloneTenantSchema from "./post_tenant_clone_new_schema";

// Environment variables for Railway
// const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
// const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
// const RAILWAY_REPO_ADMIN = process.env.RAILWAY_REPO_ADMIN;
// const RAILWAY_REPO_CUSTOMER = process.env.RAILWAY_REPO_CUSTOMER;
// const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
// const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

const {
  RAILWAY_TOKEN,
  RAILWAY_GRAPHQL_URL,
  RAILWAY_REPO_ADMIN,
  RAILWAY_REPO_CUSTOMER,
  RAILWAY_PROJECT_ID,
  RAILWAY_ENVIRONMENT_ID,
} = process.env;

interface AvailableTenant {
  tenant_id: number;
  used: boolean;
  tenant_login_id: number;
  tenant_schema: string;
  tenant_host: string;
  service_created: boolean;
  column_used_with_false_value: number;
  admin_secret: string;
  customer_secret: string;
  admin_host: string;
}

async function theWholeFlowCustomer(c: Context): Promise<Response> {

  console.log("theWholeFlowCustomer check env variables begin");
  // Ensure required environment variables are set
  if (
    !RAILWAY_TOKEN ||
    !RAILWAY_GRAPHQL_URL ||
    !RAILWAY_REPO_ADMIN ||
    !RAILWAY_REPO_CUSTOMER ||
    !RAILWAY_PROJECT_ID ||
    !RAILWAY_ENVIRONMENT_ID
  ) {
    return c.json(
      { message: "Missing required Railway environment variable(s)." },
      500
    );
  }

  console.log("theWholeFlow function begin");

  try {
    // Step 1: Create a new tenant login record
    const newTenantRecord = await postTenantCreateNewTenantLoginRecord(c);
    console.log("newTenantRecord", newTenantRecord);

    // Step 2: Get tenant login availability
    const availability = await getTenantLoginAvailability(c);

    console.log("availability", availability);

    // Step 3: Select the first available tenant login record
    const availableTenant: AvailableTenant | undefined = availability.find(
      (tenant) => !tenant.used && !tenant.service_created
    );

    if (!availableTenant) {
      return c.json(
        { message: "No available tenant login records for service creation." },
        400
      );
    }

    console.log("Selected tenant for service creation:", availableTenant);

    const repoCustomer = RAILWAY_REPO_CUSTOMER;
    const serviceName = `${availableTenant.tenant_host}_customer`;
    // Step 4: Prepare GraphQL mutation payload for service creation
    // Step 5: Perform the GraphQL request to Railway to create a new service
    const createNewServiceResponse = await postTenantCreateNewService(
      availableTenant,
      serviceName,
      repoCustomer
    );

    console.log("Service creation response:", createNewServiceResponse);

    console.log(
      "Service creation response serviceId:",
      createNewServiceResponse.id
    );

    const targetDomain = `${availableTenant.tenant_host}.up.railway.app`;

    // Step 6: Perform the GraphQL request to Railway to change the service domain
    const changeServiceDomainResponse = await postTenantChangeServiceDomain(
      createNewServiceResponse.id,
      availableTenant.tenant_host,
      targetDomain
    );

    console.log("Service domain change response:", changeServiceDomainResponse);

    // Step 7: Perform the GraphQL request to Railway to change the service environment variables
    const changeServiceEnvVariableResponse =
      await postTenantChangeServiceEnvVaiable(
        "TENANT_HOST",
        availableTenant.tenant_host,
        createNewServiceResponse.id
      );
    const changeServiceEnvVariableResponse2 =
      await postTenantChangeServiceEnvVaiable(
        "MEMBI_CUSTOMER_SECRET",
        availableTenant.customer_secret,
        createNewServiceResponse.id
      );
    const changeServiceEnvVariableResponse3 =
      await postTenantChangeServiceEnvVaiable(
        "NEXT_PUBLIC_API_URL",
        "https://membi-back-production.up.railway.app",
        createNewServiceResponse.id
      );

    console.log(
      "Service env variable change response:",
      changeServiceEnvVariableResponse,
      changeServiceEnvVariableResponse2,
      changeServiceEnvVariableResponse3
    );

    // Step 8: Perform the GraphQL request to Railway to connect service to github repo branch, this will automatically deploy the service
    const serviceConnectResponse = await postTenantServiceConnect(
      createNewServiceResponse.id,
      repoCustomer,
      "main"
    );

    console.log("Service connect response:", serviceConnectResponse);

    // const cloneTenantSchemaResponse = await cloneTenantSchema(
    //   availableTenant.tenant_schema
    // );

    // console.log(
    //   "Schema cloned from membi_template_schema: ",
    //   cloneTenantSchemaResponse
    // );

    // Step 9: Update the tenant login record to mark the service as created
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 9A: Insert the Railway service info into system_schema.railway_services
      await client.query(
        `
        INSERT INTO system_schema.railway_services_customer (
          project_id,
          environment_id,
          railway_services_id,
          tenant_login_id,
          service_name,
          service_domain_id
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
      `,
        [
          createNewServiceResponse.projectId,
          RAILWAY_ENVIRONMENT_ID,
          createNewServiceResponse.id,
          availableTenant.tenant_login_id,
          createNewServiceResponse.name,
          changeServiceDomainResponse.id,
        ]
      );

      // 9B: Mark the tenant login record as service_created
      // await client.query(
      //   `
      //   UPDATE system_schema.system_tenant_login
      //   SET service_created = true
      //   WHERE tenant_login_id = $1
      //   `,
      //   [availableTenant.tenant_login_id]
      // );

      await client.query("COMMIT");

      console.log(
        `Tenant login record with ID ${availableTenant.tenant_login_id} marked as service created.`
      );
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error inserting Railway service info:", err);
      throw err;
    } finally {
      client.release();
    }

    // Step 10: Return success response
    return c.json({
      message: "Service created successfully on Railway.",
      railwayResponse: createNewServiceResponse,
    });
  } catch (err) {
    console.error("Error in theWholeFlow:", err);
    return c.json(
      { message: "An error occurred while creating the service.", error: err },
      500
    );
  }
}

export default theWholeFlowCustomer;
