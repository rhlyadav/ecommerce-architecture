const browserConfig = typeof window !== "undefined" ? window.__HOST_APP_CONFIG__ || {} : {};

const userApiBaseUrl = browserConfig.userApiBaseUrl || process.env.USER_API_BASE_URL || "http://localhost:4001/api";
const productApiBaseUrl = browserConfig.productApiBaseUrl || process.env.PRODUCT_API_BASE_URL || "http://localhost:4002/api";
const productGraphqlUrl = browserConfig.productGraphqlUrl || process.env.PRODUCT_GRAPHQL_URL || "http://localhost:4002/api/graphql";
const chatApiBaseUrl = browserConfig.chatApiBaseUrl || process.env.CHAT_API_BASE_URL || "http://localhost:4003/api";
const chatSocketUrl = browserConfig.chatSocketUrl || process.env.CHAT_SOCKET_URL || "http://localhost:4003";

module.exports = {
  userApiBaseUrl,
  productApiBaseUrl,
  productGraphqlUrl,
  chatApiBaseUrl,
  chatSocketUrl
};
