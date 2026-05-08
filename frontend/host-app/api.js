const { userApiBaseUrl, productApiBaseUrl, chatApiBaseUrl } = require("./config");
const { apiClient } = require("./store");

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildHeaders(token, extraHeaders = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

async function requestJson(url, options = {}) {
  try {
    const response = await apiClient.request({
      url,
      method: options.method || "GET",
      headers: options.headers,
      data: options.body
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data || null;
      const message = data && (data.message || data.error) ? data.message || data.error : "Request failed";
      throw new ApiError(message, error.response.status, data);
    }

    throw new ApiError(error.message || "Network request failed", 0, null);
  }
}

function listProducts() {
  return requestJson(`${productApiBaseUrl}/products`);
}

function createProduct(payload, token) {
  return requestJson(`${productApiBaseUrl}/products`, {
    method: "POST",
    headers: buildHeaders(token),
    body: payload
  });
}

function listUsers(token) {
  return requestJson(`${userApiBaseUrl}/users`, {
    headers: buildHeaders(token)
  });
}

function listActivity(token) {
  return requestJson(`${userApiBaseUrl}/users/activity`, {
    headers: buildHeaders(token)
  });
}

function register(payload) {
  return requestJson(`${userApiBaseUrl}/auth/register`, {
    method: "POST",
    headers: buildHeaders(),
    body: payload
  });
}

function login(payload) {
  return requestJson(`${userApiBaseUrl}/auth/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: payload
  });
}

function getCurrentUser(token) {
  return requestJson(`${userApiBaseUrl}/auth/me`, {
    headers: buildHeaders(token)
  });
}

function createUser(payload, token) {
  return requestJson(`${userApiBaseUrl}/users`, {
    method: "POST",
    headers: buildHeaders(token),
    body: payload
  });
}

function listConversation(otherUserId, token) {
  return requestJson(`${chatApiBaseUrl}/chat/conversations/${otherUserId}`, {
    headers: buildHeaders(token)
  });
}

module.exports = {
  ApiError,
  listProducts,
  createProduct,
  listUsers,
  listActivity,
  register,
  login,
  getCurrentUser,
  createUser,
  listConversation
};
