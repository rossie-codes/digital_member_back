// src/controllers/tenant_controllers/post_tenant change_service_domain.ts

// Environment variables for Railway
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const RAILWAY_GRAPHQL_URL = process.env.RAILWAY_GRAPHQL_URL;
const RAILWAY_REPO = process.env.RAILWAY_REPO;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;


interface ServiceCreate {
  createdAt: string;
  id: string;
  name: string;
  projectId: string;
  templateThreadSlug: string;
  updatedAt: string;
}

async function postTenantChangeServiceDomain(
  serviceId: string,
  tenantHost: string
): Promise<ServiceCreate> {
  console.log("postTenantChangeServiceDomain function begin");

  console.log("Selected tenant for service creation serviceId:", serviceId);
  console.log("Selected tenant for service creation tenantHost:", tenantHost);

  // Step 4: Prepare GraphQL mutation payload
  const graphqlQuery = {
    query: `
      mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
        serviceDomainCreate(input: $input) {
            __typename
            createdAt
            deletedAt
            domain
            environmentId
            id
            projectId
            serviceId
            suffix
            updatedAt
            targetPort
    }
}
    `,
    variables: {
      input: {
        serviceId: serviceId,
        environmentId: RAILWAY_ENVIRONMENT_ID,
        targetPort: 8080,
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

    const serviceDomainCreateResponse = await response.json();

    if (!response.ok) {
      console.error("GraphQL Error:", serviceDomainCreateResponse);
      return serviceDomainCreateResponse.errors;
    }

    console.log("Service domain create response:", serviceDomainCreateResponse);
    console.log(
      "Service domain create response id:",
      serviceDomainCreateResponse.data.serviceDomainCreate.id
    );

    const graphqlQuery2 = {
      query: `
      mutation serviceDomainUpdate($input: ServiceDomainUpdateInput!) {
          serviceDomainUpdate(input: $input)
      }
      `,
      variables: {
        input: {
          serviceId: serviceId,
          environmentId: RAILWAY_ENVIRONMENT_ID,
          serviceDomainId:
            serviceDomainCreateResponse.data.serviceDomainCreate.id,
          domain: `${tenantHost}.up.railway.app`,
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
        body: JSON.stringify(graphqlQuery2),
      });

      const serviceDomainUpdateResponse = await response.json();

      console.log("Service domain update response:", serviceDomainUpdateResponse);

      if (!response.ok) {
        console.error("GraphQL Error:", serviceDomainUpdateResponse);
        return serviceDomainUpdateResponse.errors;
      }

      // serviceDomainUpdate returns "ture" only, so we return the serviceDomainCreate
      const { serviceDomainCreate } = serviceDomainCreateResponse.data;

      console.log("postTenantChangeServiceDomain function done");
      
      return serviceDomainCreate;
    } catch (err) {
      console.error("Error postTenantChangeServiceDomain:", err);
      throw err;
    }
  } catch (err) {
    console.error("Error postTenantChangeServiceDomain:", err);
    throw err;
  }
}

export default postTenantChangeServiceDomain;
