import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { authActions, uiActions } from "./store";
import { ApiError, createProduct, createUser, getCurrentUser, listActivity, listProducts, listUsers, login, register } from "./api";
import Chat from "./Chat";

const RemoteProductCatalog = React.lazy(() => import("remoteApp/ProductCatalog"));
const RemoteStateSharingDemo = React.lazy(() => import("remoteApp/StateSharingDemo"));

const shellStyles = {
  page: {
    minHeight: "100vh",
    color: "#0f172a",
    background: "radial-gradient(circle at top left, #e0e7ff 0%, #f8fafc 42%, #eef2ff 100%)",
    fontFamily: "'Segoe UI', sans-serif",
    display: "grid",
    gridTemplateRows: "72px 1fr auto"
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(12px, 3vw, 24px)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)"
  },
  headerBrand: {
    fontWeight: 800,
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  headerBrandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 14
  },
  headerMeta: {
    color: "#475569",
    fontSize: 14,
    "@media (max-width:900px)": {
      display: "none"
    }
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  appBody: {
    display: "grid",
    gridTemplateColumns: "260px minmax(0, 1fr)",
    gap: 12,
    padding: "14px 16px",
    maxWidth: 1320,
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
    "@media (max-width:1100px)": {
      gridTemplateColumns: "220px minmax(0, 1fr)",
      gap: 14
    },
    "@media (max-width:900px)": {
      gridTemplateColumns: "1fr",
      padding: "14px 12px"
    }
  },
  appBodyFull: {
    gridTemplateColumns: "minmax(0, 1fr)",
    maxWidth: 1080
  },
  sidebar: {
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.25)",
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    padding: 10,
    display: "grid",
    alignContent: "start",
    gap: 6,
    height: "fit-content",
    position: "sticky",
    top: 84,
    "@media (max-width:900px)": {
      position: "static",
      top: "auto"
    }
  },
  sidebarTitle: {
    margin: 0,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#475569"
  },
  sidebarItem: {
    border: "1px solid transparent",
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 8,
    background: "transparent",
    color: "#334155",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sidebarItemLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 700
  },
  sidebarItemHint: {
    display: "block",
    marginTop: 2,
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500
  },
  sidebarItemActive: {
    background: "rgba(15, 118, 110, 0.12)",
    color: "#0f766e",
    borderColor: "rgba(15, 118, 110, 0.3)"
  },
  content: {
    minWidth: 0,
    display: "grid",
    gap: 12
  },
  dashboardLayout: {
    display: "grid",
    gap: 12
  },
  authContainer: {
    minHeight: "calc(100vh - 190px)",
    display: "grid",
    alignItems: "center",
    padding: "12px 0"
  },
  authLayout: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 440px)",
    gap: 20,
    alignItems: "center",
    "@media (max-width:900px)": {
      gridTemplateColumns: "1fr",
      gap: 18
    }
  },
  authIntro: {
    display: "grid",
    gap: 12,
    maxWidth: 560
  },
  authEyebrow: {
    margin: 0,
    color: "#0f766e",
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 13
  },
  authTrustRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8
  },
  authTrustPill: {
    fontSize: 13,
    padding: "7px 11px",
    borderRadius: 999,
    border: "1px solid rgba(15, 23, 42, 0.1)",
    background: "rgba(255,255,255,0.72)",
    color: "#334155"
  },
  authCard: {
    background: "rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    borderRadius: "16px !important",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.12)",
    width: "100%",
    maxWidth: 460,
    justifySelf: "end",
    padding: "22px 20px",
    overflow: "hidden",
    boxSizing: "border-box",
    "@media (max-width:900px)": {
      justifySelf: "stretch",
      maxWidth: "100%"
    }
  },
  footer: {
    borderTop: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: 13,
    background: "rgba(255,255,255,0.8)"
  },
  hero: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.9fr)",
    alignItems: "stretch",
    "@media (max-width:1100px)": {
      gridTemplateColumns: "1fr"
    }
  },
  panel: {
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    borderRadius: 10,
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.06)",
    padding: 18,
    backdropFilter: "blur(10px)"
  },
  stats: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginTop: 12
  },
  cards: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    marginTop: 12
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 14,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 14,
    minHeight: 110,
    resize: "vertical",
    boxSizing: "border-box"
  },
  button: {
    border: 0,
    borderRadius: 10,
    padding: "12px 18px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #0f766e 0%, #0f766e 45%, #0b615a 100%)",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 8px 16px rgba(15, 118, 110, 0.28)"
  },
  secondaryButton: {
    border: "1px solid rgba(15, 118, 110, 0.7)",
    borderRadius: 10,
    padding: "12px 18px",
    cursor: "pointer",
    background: "#ffffff",
    color: "#0f766e",
    fontWeight: 700
  },
  muted: {
    color: "#475569"
  },
  form: {
    display: "grid",
    gap: 12
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10
  },
  segmentedControl: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 18
  }
};

function ShellFrame({ title, subtitle, sidebar, headerAction, hideFooter, children }) {
  const hasSidebar = Boolean(sidebar);

  return (
    <Box component="main" sx={shellStyles.page}>
      <Box component="header" sx={shellStyles.header}>
        <Typography sx={shellStyles.headerBrand}>
          <Box component="span" sx={shellStyles.headerBrandBadge}>
            SC
          </Box>
          Social Commerce Hub
        </Typography>
        <Box sx={shellStyles.headerRight}>
          <Typography sx={shellStyles.headerMeta}>{subtitle || "Connected micro-frontend experience"}</Typography>
          {headerAction || null}
        </Box>
      </Box>
      <Box component="section" sx={{ ...shellStyles.appBody, ...(hasSidebar ? {} : shellStyles.appBodyFull) }}>
        {hasSidebar ? (
          <Box component="aside" sx={shellStyles.sidebar}>
            <Typography component="p" sx={shellStyles.sidebarTitle}>
              {title}
            </Typography>
            {sidebar}
          </Box>
        ) : null}
        <Box sx={shellStyles.content}>{children}</Box>
      </Box>
      {hideFooter ? null : (
        <Box component="footer" sx={shellStyles.footer}>
          Built with React micro-frontends, Redux, and real-time services.
        </Box>
      )}
    </Box>
  );
}

function DashboardStat({ label, value, tone }) {
  return (
    <Card
      sx={{
        ...shellStyles.panel,
        padding: 18,
        background: tone || "rgba(255, 255, 255, 0.78)"
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography sx={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: 1.1 }}>{label}</Typography>
        <Typography sx={{ fontSize: 34, fontWeight: 800, mt: 1 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function AuthScreen() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const notice = useSelector((state) => state.ui.notice);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const authMutation = useMutation({
    mutationFn: async (payload) => {
      if (mode === "register") {
        return register(payload);
      }

      return login({ email: payload.email, password: payload.password });
    },
    onSuccess: (data) => {
      dispatch(authActions.setCredentials(data));
      dispatch(uiActions.showNotice(mode === "register" ? "Account created and signed in." : "Signed in successfully."));
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      dispatch(uiActions.showNotice(error.message));
    }
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(uiActions.clearNotice());
    authMutation.mutate(form);
  }

  return (
    <ShellFrame
      subtitle="Welcome back. Sign in to continue."
      hideFooter
    >
      <Box component="section" sx={shellStyles.authContainer}>
        <Box sx={shellStyles.authLayout}>
          <Box sx={shellStyles.authIntro}>
            <p style={shellStyles.authEyebrow}>Commerce Dashboard</p>
            <Typography sx={{ fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>
              Sell smarter with one clean control center.
            </Typography>
            <Typography sx={{ ...shellStyles.muted, fontSize: 17, maxWidth: 520 }}>
              Manage users, products, activity, and realtime conversations from a single secure workspace.
            </Typography>
            <Box sx={shellStyles.authTrustRow}>
              <span style={shellStyles.authTrustPill}>Secure sign-in</span>
              <span style={shellStyles.authTrustPill}>Realtime sync</span>
              <span style={shellStyles.authTrustPill}>Micro-frontend architecture</span>
            </Box>
          </Box>

          <Card square sx={shellStyles.authCard}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
                {mode === "login" ? "Sign in" : "Create account"}
              </Typography>
              <Typography sx={{ ...shellStyles.muted, mb: 3 }}>
                {mode === "login" ? "Use your account credentials to continue." : "Create your account to access the dashboard."}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={shellStyles.segmentedControl}>
                <Button
                  type="button"
                  onClick={() => setMode("login")}
                  variant={mode === "login" ? "contained" : "outlined"}
                  sx={{ flex: 1, minHeight: 42 }}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  onClick={() => setMode("register")}
                  variant={mode === "register" ? "contained" : "outlined"}
                  sx={{ flex: 1, minHeight: 42 }}
                >
                  Register
                </Button>
              </Stack>

              <form onSubmit={handleSubmit} style={shellStyles.form}>
                {mode === "register" ? (
                  <TextField
                    placeholder="Full name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    size="small"
                    fullWidth
                  />
                ) : null}
                <TextField
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  size="small"
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={authMutation.isPending} sx={{ minHeight: 44 }}>
                  {authMutation.isPending ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
                </Button>
              </form>

              {notice ? <Alert sx={{ mt: 2 }} severity={authMutation.isError ? "error" : "success"}>{notice}</Alert> : null}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ShellFrame>
  );
}

function QuerySection({ title, description, children }) {
  return (
    <Card sx={shellStyles.panel}>
      <Typography variant="h5" sx={{ mt: 0 }}>
        {title}
      </Typography>
      {description ? <Typography sx={{ ...shellStyles.muted, mt: 0 }}>{description}</Typography> : null}
      {children}
    </Card>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  const notice = useSelector((state) => state.ui.notice);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "", description: "" });
  const [activeSidebarPanel, setActiveSidebarPanel] = useState("feed");

  const meQuery = useQuery({
    queryKey: ["auth", "me", token],
    queryFn: () => getCurrentUser(token),
    enabled: Boolean(token),
    retry: false
  });

  const usersQuery = useQuery({
    queryKey: ["users", token],
    queryFn: () => listUsers(token),
    enabled: Boolean(token)
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts
  });

  const activityQuery = useQuery({
    queryKey: ["activity", token],
    queryFn: () => listActivity(token),
    enabled: Boolean(token),
    refetchInterval: 5000
  });

  const createUserMutation = useMutation({
    mutationFn: (payload) => createUser(payload, token),
    onSuccess: () => {
      setUserForm({ name: "", email: "", password: "" });
      dispatch(uiActions.showNotice("New user provisioned successfully."));
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      dispatch(uiActions.showNotice(error.message));
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (payload) => createProduct(payload, token),
    onSuccess: () => {
      setProductForm({ name: "", price: "", description: "" });
      dispatch(uiActions.showNotice("Product created and event published."));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (error) => {
      dispatch(uiActions.showNotice(error.message));
    }
  });

  const counts = useMemo(
    () => ({
      users: usersQuery.data ? usersQuery.data.length : 0,
      products: productsQuery.data ? productsQuery.data.length : 0,
      activity: activityQuery.data ? activityQuery.data.length : 0
    }),
    [activityQuery.data, productsQuery.data, usersQuery.data]
  );

  useEffect(() => {
    if (meQuery.data) {
      dispatch(authActions.syncUser(meQuery.data));
    }
  }, [dispatch, meQuery.data]);

  useEffect(() => {
    const protectedError =
      meQuery.error || usersQuery.error || activityQuery.error || createUserMutation.error || createProductMutation.error;

    if (protectedError instanceof ApiError && protectedError.status === 401) {
      dispatch(authActions.clearCredentials());
      dispatch(uiActions.showNotice("Session expired. Please sign in again."));
      queryClient.clear();
    }
  }, [
    activityQuery.error,
    createProductMutation.error,
    createUserMutation.error,
    dispatch,
    meQuery.error,
    queryClient,
    usersQuery.error
  ]);

  function handleLogout() {
    dispatch(authActions.clearCredentials());
    dispatch(uiActions.showNotice("Signed out."));
    queryClient.clear();
  }

  const dashboardSections = [
    { key: "feed", label: "Overview", hint: "Metrics and product feed" },
    { key: "users", label: "Users", hint: "Manage workspace members" },
    { key: "activity", label: "Activity", hint: "Cross-service events" },
    { key: "products", label: "Products", hint: "Create catalog items" },
    { key: "chat", label: "Chat", hint: "Realtime messaging" },
    { key: "state", label: "Shared State", hint: "Redux federation demo" }
  ];

  return (
    <ShellFrame
      title="Navigation"
      subtitle={currentUser ? `Welcome, ${currentUser.name}` : "Loading profile"}
      headerAction={
        <button type="button" onClick={handleLogout} style={shellStyles.secondaryButton}>
          Sign out
        </button>
      }
      sidebar={
        <>
          {dashboardSections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSidebarPanel(section.key)}
              style={{ ...shellStyles.sidebarItem, ...(activeSidebarPanel === section.key ? shellStyles.sidebarItemActive : {}) }}
            >
              <span style={shellStyles.sidebarItemLabel}>{section.label}</span>
              <span style={shellStyles.sidebarItemHint}>{section.hint}</span>
            </button>
          ))}
        </>
      }
    >
      <Box sx={shellStyles.dashboardLayout}>
        {notice ? (
          <Alert severity="info" sx={{ borderRadius: "10px" }}>
            {notice}
          </Alert>
        ) : null}

        {activeSidebarPanel === "feed" ? (
          <>
          <Card sx={shellStyles.panel}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>
                    Operations overview
                  </Typography>
                  <Typography sx={{ ...shellStyles.muted, mt: 0.5 }}>
                    Track users, products, and service activity from one dashboard.
                  </Typography>
                </Box>
                <Chip
                  label={currentUser ? `Signed in as ${currentUser.name}` : "Profile syncing..."}
                  color="success"
                  variant="outlined"
                />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Box sx={shellStyles.quickActions}>
                <Button size="small" variant="outlined" onClick={() => setActiveSidebarPanel("users")}>
                  Add user
                </Button>
                <Button size="small" variant="outlined" onClick={() => setActiveSidebarPanel("products")}>
                  Create product
                </Button>
                <Button size="small" variant="outlined" onClick={() => setActiveSidebarPanel("chat")}>
                  Open chat
                </Button>
              </Box>
              {(usersQuery.isLoading || productsQuery.isLoading || activityQuery.isLoading) ? <LinearProgress sx={{ mt: 2 }} /> : null}
            </CardContent>
          </Card>

          <section style={shellStyles.stats}>
            <DashboardStat label="Users" value={counts.users} tone="rgba(224, 242, 254, 0.9)" />
            <DashboardStat label="Products" value={counts.products} tone="rgba(254, 243, 199, 0.9)" />
            <DashboardStat label="Events" value={counts.activity} tone="rgba(220, 252, 231, 0.9)" />
          </section>

          <section style={{ marginTop: 14 }}>
            <QuerySection title="Product Details Feed" description="Default feed showing live product details from host state.">
              {productsQuery.isLoading ? (
                <p>Loading products...</p>
              ) : productsQuery.error ? (
                <p style={{ color: "#b91c1c" }}>{productsQuery.error.message}</p>
              ) : (
                <Suspense fallback={<p>Loading remote catalog...</p>}>
                  <RemoteProductCatalog items={productsQuery.data} title="Live product details" />
                </Suspense>
              )}
            </QuerySection>
          </section>
          </>
        ) : null}

        {activeSidebarPanel === "users" ? (
          <>
          <section style={shellStyles.cards}>
            <QuerySection
              title="Invite User"
              description="Protected mutation through user-service. This demonstrates Redux-provided auth state flowing into React Query mutations."
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  dispatch(uiActions.clearNotice());
                  createUserMutation.mutate(userForm);
                }}
                style={shellStyles.form}
              >
                <input
                  placeholder="Name"
                  value={userForm.name}
                  onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                  style={shellStyles.input}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                  style={shellStyles.input}
                />
                <input
                  type="password"
                  placeholder="Temporary password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                  style={shellStyles.input}
                />
                <button type="submit" style={shellStyles.button} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create user"}
                </button>
              </form>
            </QuerySection>
          </section>

          <section style={{ marginTop: 14 }}>
            <QuerySection title="Users from user-service">
              {usersQuery.isLoading ? (
                <p>Loading users...</p>
              ) : usersQuery.error ? (
                <p style={{ color: "#b91c1c" }}>{usersQuery.error.message}</p>
              ) : usersQuery.data.length === 0 ? (
                <p>No users yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {usersQuery.data.map((user) => (
                    <article key={user.id} style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                      <strong>{user.name}</strong>
                      <div style={shellStyles.muted}>{user.email}</div>
                    </article>
                  ))}
                </div>
              )}
            </QuerySection>
          </section>
          </>
        ) : null}

        {activeSidebarPanel === "activity" ? (
          <section style={{ marginTop: 14 }}>
            <QuerySection title="Cross-service activity">
              {activityQuery.isLoading ? (
                <p>Loading event stream...</p>
              ) : activityQuery.error ? (
                <p style={{ color: "#b91c1c" }}>{activityQuery.error.message}</p>
              ) : activityQuery.data.length === 0 ? (
                <p>No product events received yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {activityQuery.data.map((event) => (
                    <article key={event.productId} style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                      <strong>{event.name}</strong>
                      <p style={{ marginBottom: 6 }}>{event.summary}</p>
                      <small style={shellStyles.muted}>Received: {new Date(event.receivedAt).toLocaleString()}</small>
                    </article>
                  ))}
                </div>
              )}
            </QuerySection>
          </section>
        ) : null}

        {activeSidebarPanel === "products" ? (
          <section style={{ marginTop: 14 }}>
            <QuerySection
              title="Create Product"
              description="Protected write to product-service. Successful creation still publishes an event to Redis for user-service activity."
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  dispatch(uiActions.clearNotice());
                  createProductMutation.mutate({
                    ...productForm,
                    price: Number(productForm.price)
                  });
                }}
                style={shellStyles.form}
              >
                <input
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                  style={shellStyles.input}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                  style={shellStyles.input}
                />
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                  style={shellStyles.textarea}
                />
                <button type="submit" style={shellStyles.button} disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? "Saving..." : "Save product"}
                </button>
              </form>
            </QuerySection>
          </section>
        ) : null}

        {activeSidebarPanel === "chat" ? (
          <section style={{ marginTop: 14 }}>
            <QuerySection
              title="Direct Messages"
              description="Two authenticated users can exchange realtime messages here through the dedicated chat-service."
            >
              {usersQuery.isLoading ? (
                <p>Loading chat contacts...</p>
              ) : usersQuery.error ? (
                <p style={{ color: "#b91c1c" }}>{usersQuery.error.message}</p>
              ) : (
                <Chat
                  token={token}
                  currentUser={currentUser}
                  users={usersQuery.data || []}
                  showNotice={(message) => dispatch(uiActions.showNotice(message))}
                />
              )}
            </QuerySection>
          </section>
        ) : null}

        {activeSidebarPanel === "state" ? (
          <section style={{ marginTop: 14 }}>
            <QuerySection title="State Sharing Demo" description="Remote component accessing shared Redux state directly from host.">
              <Suspense fallback={<p>Loading state sharing demo...</p>}>
                <RemoteStateSharingDemo />
              </Suspense>
            </QuerySection>
          </section>
        ) : null}
      </Box>
    </ShellFrame>
  );
}

export default function App() {
  const token = useSelector((state) => state.auth.token);

  return token ? <Dashboard /> : <AuthScreen />;
}
