import React from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";

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
  const { user } = useSharedAuth();

  const catalogItems = Array.isArray(items) && items.length > 0 ? items : [
    { id: 1, name: "Edge Sneakers", tag: "Remote module card" },
    { id: 2, name: "Orbit Backpack", tag: "Shared into Next host" },
    { id: 3, name: "Graph Tee", tag: "Webpack federation demo" }
  ];

  return (
    <Stack spacing={1.5} sx={{ width: "100%", minWidth: 0 }}>
      {title ? (
        <Typography sx={{ m: 0, color: "#475569", fontWeight: 700, letterSpacing: 0.4 }} variant="subtitle2">
          {title}
        </Typography>
      ) : null}
      {user ? (
        <Alert severity="success" sx={{ py: 0 }}>
          Welcome {user.name}!
        </Alert>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 1.5,
          width: "100%",
          minWidth: 0
        }}
      >
        {catalogItems.map((item) => (
          <Card
            key={item.id || item._id}
            sx={{
              border: "1px solid rgba(148, 163, 184, 0.28)",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
              height: "100%",
              minWidth: 0
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                {item.name}
              </Typography>
              {"price" in item ? (
                <Typography sx={{ mt: 1, color: "#0f766e", fontWeight: 800 }}>${Number(item.price).toFixed(2)}</Typography>
              ) : null}
              <Box component="p" sx={{ mb: 0, color: "#475569", fontSize: 14, lineHeight: 1.45, overflowWrap: "anywhere" }}>
                {item.tag || item.description || "Shared product from host application"}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
