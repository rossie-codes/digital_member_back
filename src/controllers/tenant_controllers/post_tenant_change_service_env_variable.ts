// src/controllers/tenant_controllers/post_tenant change_service_domain.ts

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO_ADMIN = process.env.RAILWAY_REPO_ADMIN;
const RAILWAY_REPO_CUSTOMER = process.env.RAILWAY_REPO_CUSTOMER;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;


interface EnvUpdate {
  name: string;
  value: string;
  status: string;
}

async function postTenantChangeServiceEnvVaiable(
  name: string,
  value: string,
  serviceId: string
): Promise<EnvUpdate> {
  console.log("postTenantChangeServiceEnvVaiable function begin");

  console.log("Selected tenant for service creation name:", name);
  console.log("Selected tenant for service creation value:", value);
  console.log("Selected tenant for service creation serviceId:", serviceId);

  const graphqlQuery = {
    query: `
        mutation variableUpsert($input: VariableUpsertInput!) {
            variableUpsert(input: $input)
        }
    `,
    variables: {
      input: {
        environmentId: RAILWAY_ENVIRONMENT_ID,
        projectId: RAILWAY_PROJECT_ID,
        serviceId: serviceId,
        name: name,
        value: value,
      },
    },
  };

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

    const serviceEnvUpdateResponse = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", serviceEnvUpdateResponse);
      return serviceEnvUpdateResponse.errors;
    }

    console.log("Service env update response:", serviceEnvUpdateResponse);

    const { variableUpsert } = serviceEnvUpdateResponse.data;

    return variableUpsert;
  } catch (err) {
    console.error("Error postTenantChangeServiceEnvVaiable:", err);
    throw err;
  }
}

export default postTenantChangeServiceEnvVaiable;
