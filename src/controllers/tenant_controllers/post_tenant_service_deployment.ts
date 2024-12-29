// src/controllers/tenant_controllers/post_tenant_service_deployment.ts

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO = process.env.RAILWAY_REPO;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

interface EnvUpdate {
  name: string;
  value: string;
  status: string;
}

async function postTenantServiceDeployment(
  serviceId: string
): Promise<EnvUpdate> {
  console.log("async function postTenantServiceDeployment function begin");

  console.log("Selected tenant for service creation serviceId:", serviceId);

  const graphqlQuery = {
    query: `
        mutation serviceInstanceDeploy($environmentId: String!, $serviceId: String!) {
            serviceInstanceDeploy(environmentId: $environmentId, serviceId: $serviceId)
        }
    `,
    variables: {
      environmentId: RAILWAY_ENVIRONMENT_ID,
      serviceId: serviceId,
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

    const serviceDeploymentResponse = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", serviceDeploymentResponse);
      return serviceDeploymentResponse.errors;
    }

    console.log("Service env update response:", serviceDeploymentResponse);

    const { serviceInstanceDeploy } = serviceDeploymentResponse.data;

    return serviceInstanceDeploy;
  } catch (err) {
    console.error("Error async function postTenantServiceDeployment:", err);
    throw err;
  }
}

export default postTenantServiceDeployment;
