const { buildSchema, graphql } = require("graphql");
const { Product } = require("./models");
const { publishProductCreatedEvent } = require("./events");
const { authenticateHeader } = require("./middleware");

const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    createdAt: String
    updatedAt: String
  }

  input CreateProductInput {
    name: String!
    price: Float!
    description: String
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
  }
`);

function toGraphqlProduct(product) {
  if (!product) {
    return null;
  }

  const json = typeof product.toJSON === "function" ? product.toJSON() : product;

  return {
    id: String(json._id || json.id),
    name: json.name,
    price: json.price,
    description: json.description || "",
    createdAt: json.createdAt ? new Date(json.createdAt).toISOString() : null,
    updatedAt: json.updatedAt ? new Date(json.updatedAt).toISOString() : null
  };
}

function requireGraphqlAuth(req) {
  return authenticateHeader(req.headers.authorization || "");
}

const rootValue = {
  products: async () => {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map(toGraphqlProduct);
  },
  product: async ({ id }) => {
    const product = await Product.findById(id);
    return toGraphqlProduct(product);
  },
  createProduct: async ({ input }, req) => {
    requireGraphqlAuth(req);

    const product = await Product.create({
      name: input.name,
      price: input.price,
      description: input.description || ""
    });

    await publishProductCreatedEvent(product);
    return toGraphqlProduct(product);
  }
};

async function handleGraphql(req, res) {
  const { query, variables, operationName } = req.body || {};

  if (!query) {
    return res.status(400).json({ errors: [{ message: "GraphQL query is required" }] });
  }

  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      contextValue: req,
      variableValues: variables,
      operationName
    });

    const status = result.errors ? 400 : 200;
    return res.status(status).json(result);
  } catch (error) {
    console.error("GraphQL request failed", error);
    return res.status(500).json({ errors: [{ message: "GraphQL request failed" }] });
  }
}

module.exports = {
  handleGraphql,
  schema
};
