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
  const { user, status } = useSharedAuth();

  const catalogItems = Array.isArray(items) && items.length > 0 ? items : [
    { id: 1, name: "Edge Sneakers", tag: "Remote module card" },
    { id: 2, name: "Orbit Backpack", tag: "Shared into Next host" },
    { id: 3, name: "Graph Tee", tag: "Webpack federation demo" }
  ];

  return (
    <Stack spacing={1.5}>
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
      {catalogItems.map((item) => (
        <Card
          key={item.id || item._id}
          sx={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "18px",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
          }}
        >
          <CardContent sx={{ p: 2.25 }}>
            <Typography variant="h6">{item.name}</Typography>
            {"price" in item ? (
              <Typography sx={{ mt: 1, color: "#0f766e", fontWeight: 700 }}>${Number(item.price).toFixed(2)}</Typography>
            ) : null}
            <Box component="p" sx={{ mb: 0 }}>
              {item.tag || item.description || "Shared product from host application"}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
