// src/controllers/tenant_controllers/post_tenant change_service_domain.ts

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO_ADMIN = process.env.RAILWAY_REPO_ADMIN;
const RAILWAY_REPO_CUSTOMER = process.env.RAILWAY_REPO_CUSTOMER;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;


interface AvailableTenant {
  tenant_id: number;
  used: boolean;
  tenant_login_id: number;
  tenant_schema: string;
  tenant_host: string;
  service_created: boolean;
  column_used_with_false_value: number;
}

interface ServiceCreate {
  createdAt: string;
  id: string;
  name: string;
  projectId: string;
  templateThreadSlug: string;
  updatedAt: string;
}

async function postTenantCreateNewService(
  availableTenant: AvailableTenant
): Promise<ServiceCreate> {
  console.log("postTenantCreateNewService function begin");

  console.log("Selected tenant for service creation:", availableTenant);

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
          repo: RAILWAY_REPO_ADMIN,
        },
        projectId: RAILWAY_PROJECT_ID,
        name: availableTenant.tenant_host,
      },
    },
  };

  // Step 5: Perform the GraphQL request to Railway
  try {
    if (!RAILWAY_GRAPHQL_URL) {
      throw new Error("Missing environment variable: RAILWAY_GRAPHQL_URL");
    }
    if (!RAILWAY_TOKEN) {
      throw new Error("Missing environment variable: RAILWAY_TOKEN");
    }

    const response = await fetch(RAILWAY_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: RAILWAY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    });

    const railwayResponse = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", railwayResponse);
      return railwayResponse.errors;
    }
  
    const { serviceCreate } = railwayResponse.data;

    console.log("postTenantCreateNewService function done");

    return serviceCreate;
  } catch (err) {
    console.error("Error postTenantCreateNewService:", err);
    throw err;
  } finally {
    // client.release();
  }
}

export default postTenantCreateNewService;
