import React from "react";
import { createRoot } from "react-dom/client";
import ProductCatalog from "./ProductCatalog";

function App() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Remote Catalog Application</h1>
      <ProductCatalog />
    </main>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
