import React from "react";

const items = [
  { id: 1, name: "Edge Sneakers", tag: "Remote module card" },
  { id: 2, name: "Orbit Backpack", tag: "Shared into Next host" },
  { id: 3, name: "Graph Tee", tag: "Webpack federation demo" }
];

export default function ProductCatalog() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item) => (
        <article
          key={item.id}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 12,
            padding: 16
          }}
        >
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <p style={{ marginBottom: 0 }}>{item.tag}</p>
        </article>
      ))}
    </div>
  );
}
