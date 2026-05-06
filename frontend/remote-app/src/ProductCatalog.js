import React from "react";
import { useSelector } from "react-redux";

// Shared state hook that remote can use
export function useSharedAuth() {
  return useSelector((state) => state.auth);
}

export function useSharedUI() {
  return useSelector((state) => state.ui);
}

// Shared store provider for remotes
export function SharedStoreProvider({ children }) {
  return children; // Store is already provided by host
}

export default function ProductCatalog({ items, title }) {
  const { user, status } = useSharedAuth();

  const catalogItems = Array.isArray(items) && items.length > 0 ? items : [
    { id: 1, name: "Edge Sneakers", tag: "Remote module card" },
    { id: 2, name: "Orbit Backpack", tag: "Shared into Next host" },
    { id: 3, name: "Graph Tee", tag: "Webpack federation demo" }
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {title ? <p style={{ margin: 0, color: "#475569", fontWeight: 700, letterSpacing: 0.4 }}>{title}</p> : null}
      {user && <p style={{ margin: 0, color: "#0f766e", fontSize: 14 }}>👋 Welcome {user.name}!</p>}

      {catalogItems.map((item) => (
        <article
          key={item.id || item._id}
          style={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 18,
            padding: 18,
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
          }}
        >
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          {"price" in item ? <div style={{ marginTop: 8, color: "#0f766e", fontWeight: 700 }}>${Number(item.price).toFixed(2)}</div> : null}
          <p style={{ marginBottom: 0 }}>
            {item.tag || item.description || "Shared product from host application"}
          </p>
        </article>
      ))}
    </div>
  );
}
