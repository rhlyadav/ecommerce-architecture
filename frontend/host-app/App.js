import React, { Suspense, useEffect, useState } from "react";

const RemoteProductCatalog = React.lazy(() => import("remoteApp/ProductCatalog"));
const browserConfig = typeof window !== "undefined" ? window.__HOST_APP_CONFIG__ || {} : {};
const defaultUserApi = browserConfig.userApiUrl || "http://localhost:4001/api/users";
const defaultProductApi = browserConfig.productApiUrl || "http://localhost:4002/api/products";

export default function App() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "", description: "" });
  const [message, setMessage] = useState("");

  const userApi = defaultUserApi;
  const productApi = defaultProductApi;
  const activityApi = `${userApi}/activity`;

  async function loadData() {
    const [usersRes, productsRes, activityRes] = await Promise.all([fetch(userApi), fetch(productApi), fetch(activityApi)]);
    const usersJson = await usersRes.json();
    const productsJson = await productsRes.json();
    const activityJson = await activityRes.json();
    setUsers(usersJson);
    setProducts(productsJson);
    setActivity(activityJson);
  }

  useEffect(() => {
    loadData().catch((error) => {
      console.error("Failed to load dashboard data", error);
    });

    const intervalId = window.setInterval(() => {
      loadData().catch((error) => {
        console.error("Failed to refresh dashboard data", error);
      });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function handleUserSubmit(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(userApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(`User save failed: ${error.message}`);
      return;
    }

    setUserForm({ name: "", email: "" });
    setMessage("User saved to MySQL successfully.");
    await loadData();
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(productApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productForm,
        price: Number(productForm.price)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(`Product save failed: ${error.message}`);
      return;
    }

    setProductForm({ name: "", price: "", description: "" });
    setMessage("Product saved to MongoDB successfully.");
    await loadData();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 32 }}>
      <h1>Micro-frontend Commerce Dashboard</h1>
      <p>Host: React | Remote: React + Module Federation</p>
      {message ? <p style={{ color: "#0f766e", fontWeight: 700 }}>{message}</p> : null}

      <section style={{ marginTop: 24, display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <form
          onSubmit={handleUserSubmit}
          style={{ border: "1px solid #d1d5db", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}
        >
          <h2 style={{ margin: 0 }}>Add User</h2>
          <input
            placeholder="Name"
            value={userForm.name}
            onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
            style={{ padding: 10 }}
          />
          <input
            placeholder="Email"
            type="email"
            value={userForm.email}
            onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
            style={{ padding: 10 }}
          />
          <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
            Save User to MySQL
          </button>
        </form>

        <form
          onSubmit={handleProductSubmit}
          style={{ border: "1px solid #d1d5db", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}
        >
          <h2 style={{ margin: 0 }}>Add Product</h2>
          <input
            placeholder="Product name"
            value={productForm.name}
            onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
            style={{ padding: 10 }}
          />
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            value={productForm.price}
            onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
            style={{ padding: 10 }}
          />
          <textarea
            placeholder="Description"
            value={productForm.description}
            onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
            style={{ padding: 10, minHeight: 90 }}
          />
          <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
            Save Product to MongoDB
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Users from user-service</h2>
        {users.length === 0 ? (
          <p>No users yet. Add one with the form.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Products from product-service</h2>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product._id}>
                {product.name} - ${product.price}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Cross-service activity</h2>
        <p style={{ marginTop: 0 }}>
          When a product is created, `product-service` immediately notifies `user-service`, and the event appears here.
        </p>
        {activity.length === 0 ? (
          <p>No product events received yet. Add a product to trigger service-to-service communication.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {activity.map((event) => (
              <article
                key={event.productId}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc"
                }}
              >
                <strong>{event.name}</strong>
                <p style={{ margin: "8px 0" }}>{event.summary}</p>
                <small>
                  Product ID: {event.productId} | Price: ${event.price} | Received: {new Date(event.receivedAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Remote Catalog</h2>
        <Suspense fallback={<p>Loading remote catalog...</p>}>
          <RemoteProductCatalog />
        </Suspense>
      </section>
    </main>
  );
}
