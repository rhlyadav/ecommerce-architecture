const { userApiBaseUrl, productApiBaseUrl } = require("./config");

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
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data && (data.message || data.error) ? data.message || data.error : "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data;
}

function listProducts() {
  return requestJson(`${productApiBaseUrl}/products`);
}

function createProduct(payload, token) {
  return requestJson(`${productApiBaseUrl}/products`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload)
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
    body: JSON.stringify(payload)
  });
}

function login(payload) {
  return requestJson(`${userApiBaseUrl}/auth/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload)
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
    body: JSON.stringify(payload)
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
  createUser
};
