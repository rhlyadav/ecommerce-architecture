import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import ProductCatalog from "./ProductCatalog";
import StateSharingDemo from "./StateSharingDemo";

// Cached state object to prevent react-redux infinite re-renders
const mockState = {
  auth: {
    user: { name: "Standalone Dev", email: "dev@localhost" },
    status: "idle",
    token: null
  },
  ui: {
    notice: "Running in standalone mode"
  }
};

// Mock store to allow standalone development without the host app
const mockStore = {
  getState: () => mockState,
  subscribe: (listener) => {
    return () => {}; // return empty unsubscribe function
  },
  dispatch: (action) => {
    console.log("Mock store dispatch:", action);
    return action;
  }
};

function App() {
  return (
    <Provider store={mockStore}>
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
        <h1>Remote Catalog Application (Standalone)</h1>
        <ProductCatalog title="Standalone Catalog" />
        <StateSharingDemo />
      </main>
    </Provider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
