import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Divider, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { createProductGraphql, listProductsGraphql } from "./services/productGraphqlService";
import { useSharedAuth } from "./ProductCatalog";

const initialForm = {
  name: "",
  price: "",
  description: ""
};

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function GraphQLProductCatalog({ endpoint, title = "GraphQL product catalog" }) {
  const { token, user } = useSharedAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: true, saving: false, message: "", error: "" });

  const sortedProducts = useMemo(() => products.slice().sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)), [products]);

  const loadProducts = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const data = await listProductsGraphql({ endpoint });
      setProducts(data);
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: error.response?.errors?.[0]?.message || error.message || "Failed to load GraphQL products"
      }));
    }
  }, [endpoint]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "", message: "" }));

    try {
      const createdProduct = await createProductGraphql(
        {
          name: form.name,
          price: Number(form.price),
          description: form.description
        },
        { endpoint, token }
      );

      setProducts((current) => [createdProduct, ...current]);
      setForm(initialForm);
      setStatus((current) => ({ ...current, saving: false, message: "Product created through GraphQL." }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        saving: false,
        error: error.response?.errors?.[0]?.message || error.message || "Failed to create GraphQL product"
      }));
    }
  }

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0, overflowWrap: "anywhere" }}>
          {title}
        </Typography>
        <Typography sx={{ color: "#475569", fontSize: 14, overflowWrap: "anywhere" }}>
          Query and mutate product-service data from the remote child app.
        </Typography>
      </Box>

      {status.loading ? <LinearProgress /> : null}
      {status.error ? <Alert severity="error">{status.error}</Alert> : null}
      {status.message ? <Alert severity="success">{status.message}</Alert> : null}

      <Box
        component="form"
        onSubmit={handleCreateProduct}
        sx={{
          display: "grid",
          gap: 1.25,
          p: 1.5,
          border: "1px solid rgba(15, 23, 42, 0.1)",
          borderRadius: 1.25,
          background: "#ffffff",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box"
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14, overflowWrap: "anywhere" }}>
          Create with GraphQL mutation{user ? ` as ${user.name}` : ""}
        </Typography>
        <TextField
          label="Product name"
          value={form.name}
          onChange={(event) => updateForm("name", event.target.value)}
          size="small"
          required
          fullWidth
        />
        <TextField
          label="Price"
          type="number"
          value={form.price}
          onChange={(event) => updateForm("price", event.target.value)}
          size="small"
          required
          fullWidth
          inputProps={{ min: 0, step: "0.01" }}
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          size="small"
          multiline
          minRows={2}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={status.saving || !token}>
          {status.saving ? "Saving..." : "Run mutation"}
        </Button>
        {!token ? <Typography sx={{ color: "#b45309", fontSize: 13 }}>Sign in through the host app to run protected mutations.</Typography> : null}
      </Box>

      <Divider />

      <Stack spacing={1} sx={{ minWidth: 0 }}>
        {sortedProducts.length === 0 && !status.loading ? (
          <Typography sx={{ color: "#475569" }}>No products returned from GraphQL yet.</Typography>
        ) : null}
        {sortedProducts.map((product) => (
          <Box
            key={product.id}
            sx={{
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: 1.25,
              p: 1.5,
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              minWidth: 0
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" sx={{ minWidth: 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{product.name}</Typography>
                <Typography sx={{ color: "#475569", fontSize: 14, overflowWrap: "anywhere" }}>
                  {product.description || "No description provided."}
                </Typography>
              </Box>
              <Typography sx={{ color: "#0f766e", fontWeight: 800, flexShrink: 0 }}>{formatCurrency(product.price)}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
