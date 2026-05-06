import React from "react";

const fallbackItems = [
  { id: 1, name: "Edge Sneakers", tag: "Remote module card" },
  { id: 2, name: "Orbit Backpack", tag: "Shared into Next host" },
  { id: 3, name: "Graph Tee", tag: "Webpack federation demo" }
];

export default function ProductCatalog({ items }) {
  const catalogItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {catalogItems.map((item) => (
        <article
          key={item.id || item._id}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 12,
            padding: 16
          }}
        >
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <p style={{ marginBottom: 0 }}>
            {item.tag || item.description || "Shared product from host application"}
          </p>
        </article>
      ))}
    </div>
  );
}
