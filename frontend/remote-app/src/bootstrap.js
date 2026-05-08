import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import ProductCatalog from "./ProductCatalog";
import StateSharingDemo from "./StateSharingDemo";
import theme from "./theme";

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main style={{ fontFamily: "'Segoe UI', sans-serif", padding: "clamp(12px, 4vw, 24px)" }}>
          <h1>Remote Catalog Application (Standalone)</h1>
          <ProductCatalog title="Standalone Catalog" />
          <StateSharingDemo />
        </main>
      </ThemeProvider>
    </Provider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
