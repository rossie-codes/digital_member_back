// src/controllers/tenant_controllers/post_tenant_service_deployment.ts

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO_ADMIN = process.env.RAILWAY_REPO_ADMIN;
const RAILWAY_REPO_CUSTOMER = process.env.RAILWAY_REPO_CUSTOMER;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

async function postTenantServiceConnect(
  serviceId: string,
  targerRepo: string,
  targetBranch: string
): Promise<Response> {
  console.log("async function postTenantServiceConnect function begin");

  console.log("Selected tenant for service creation serviceId:", serviceId);

  const graphqlQuery = {
    query: `
    mutation serviceConnect($id: String!, $input: ServiceConnectInput!) {
      serviceConnect(id: $id, input: $input) {
        __typename
        createdAt
        deletedAt
        # deployments
        icon
        id
        name
        # project
        projectId
        # repoTriggers
        # serviceInstances
        templateThreadSlug
        updatedAt
      }
    }
    `,
    variables: {
      id: serviceId,
      input: {
        repo: targerRepo,
        branch: targetBranch
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

    const serviceConnectResponse = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", serviceConnectResponse);
      return serviceConnectResponse.errors;
    }

    console.log("Service env update response:", serviceConnectResponse);

    const { serviceConnect } = serviceConnectResponse.data;

    return serviceConnect;
  } catch (err) {
    console.error("Error async function postTenantServiceConnect:", err);
    throw err;
  }
}

export default postTenantServiceConnect;
