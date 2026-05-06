const browserConfig = typeof window !== "undefined" ? window.__HOST_APP_CONFIG__ || {} : {};

const userApiBaseUrl = browserConfig.userApiBaseUrl || process.env.USER_API_BASE_URL || "http://localhost:4001/api";
const productApiBaseUrl = browserConfig.productApiBaseUrl || process.env.PRODUCT_API_BASE_URL || "http://localhost:4002/api";

module.exports = {
  userApiBaseUrl,
  productApiBaseUrl
};
