import { GraphQLClient, gql } from "graphql-request";

const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id
    name
    price
    description
    createdAt
  }
`;

const PRODUCTS_QUERY = gql`
  ${PRODUCT_FIELDS}
  query Products {
    products {
      ...ProductFields
    }
  }
`;

const CREATE_PRODUCT_MUTATION = gql`
  ${PRODUCT_FIELDS}
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...ProductFields
    }
  }
`;

function getDefaultEndpoint() {
  if (typeof window === "undefined") {
    return "http://localhost:4002/api/graphql";
  }

  const config = window.__REMOTE_APP_CONFIG__ || window.__HOST_APP_CONFIG__ || {};
  return config.productGraphqlUrl || "http://localhost:4002/api/graphql";
}

function createProductGraphqlClient({ endpoint, token } = {}) {
  return new GraphQLClient(endpoint || getDefaultEndpoint(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export async function listProductsGraphql(options = {}) {
  const client = createProductGraphqlClient(options);
  const data = await client.request(PRODUCTS_QUERY);
  return data.products;
}

export async function createProductGraphql(input, options = {}) {
  const client = createProductGraphqlClient(options);
  const data = await client.request(CREATE_PRODUCT_MUTATION, { input });
  return data.createProduct;
}

export { getDefaultEndpoint };
