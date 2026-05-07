import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authActions, uiActions } from "./store";
import { ApiError, createProduct, createUser, getCurrentUser, listActivity, listProducts, listUsers, login, register } from "./api";
import Chat from "./Chat";

const RemoteProductCatalog = React.lazy(() => import("remoteApp/ProductCatalog"));
const RemoteStateSharingDemo = React.lazy(() => import("remoteApp/StateSharingDemo"));

const shellStyles = {
  page: {
    minHeight: "100vh",
    padding: 32,
    color: "#0f172a",
    background: "linear-gradient(135deg, #f7f7f2 0%, #e0f2fe 45%, #fef3c7 100%)",
    fontFamily: "'Segoe UI', sans-serif"
  },
  hero: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "1.4fr 1fr",
    alignItems: "stretch"
  },
  panel: {
    background: "rgba(255, 255, 255, 0.82)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
    padding: 24,
    backdropFilter: "blur(10px)"
  },
  stats: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginTop: 24
  },
  cards: {
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    marginTop: 24
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 14,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 14,
    minHeight: 110,
    resize: "vertical",
    boxSizing: "border-box"
  },
  button: {
    border: 0,
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    background: "#0f766e",
    color: "#fff",
    fontWeight: 700
  },
  secondaryButton: {
    border: "1px solid #0f766e",
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    background: "transparent",
    color: "#0f766e",
    fontWeight: 700
  },
  muted: {
    color: "#475569"
  },
  form: {
    display: "grid",
    gap: 12
  }
};

function DashboardStat({ label, value, tone }) {
  return (
    <article
      style={{
        ...shellStyles.panel,
        padding: 18,
        background: tone || "rgba(255, 255, 255, 0.78)"
      }}
    >
      <div style={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: 1.1 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </article>
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
    <main style={shellStyles.page}>
      <section style={shellStyles.hero}>
        <article style={{ ...shellStyles.panel, padding: 32 }}>
          <p style={{ margin: 0, color: "#0f766e", fontWeight: 700, letterSpacing: 1 }}>STATEFUL MICROFRONTEND SHELL</p>
          <h1 style={{ fontSize: 48, lineHeight: 1.05, marginBottom: 12 }}>JWT auth + Redux Toolkit + React Query in one working flow.</h1>
          <p style={{ ...shellStyles.muted, fontSize: 17, maxWidth: 620 }}>
            Host app owns identity and shared state. React Query handles live backend data. The remote catalog stays focused on
            presentation so the federation boundary remains clean.
          </p>
        </article>

        <article style={{ ...shellStyles.panel, alignSelf: "center" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <button type="button" onClick={() => setMode("login")} style={mode === "login" ? shellStyles.button : shellStyles.secondaryButton}>
              Login
            </button>
            <button type="button" onClick={() => setMode("register")} style={mode === "register" ? shellStyles.button : shellStyles.secondaryButton}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={shellStyles.form}>
            {mode === "register" ? (
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                style={shellStyles.input}
              />
            ) : null}
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              style={shellStyles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              style={shellStyles.input}
            />
            <button type="submit" style={shellStyles.button} disabled={authMutation.isPending}>
              {authMutation.isPending ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p style={{ ...shellStyles.muted, marginTop: 14 }}>
            Protected actions use the JWT issued by `user-service`, and `product-service` validates the same token before allowing product writes.
          </p>
          {notice ? <p style={{ color: authMutation.isError ? "#b91c1c" : "#0f766e", fontWeight: 700 }}>{notice}</p> : null}
        </article>
      </section>
    </main>
  );
}

function QuerySection({ title, description, children }) {
  return (
    <section style={shellStyles.panel}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {description ? <p style={{ ...shellStyles.muted, marginTop: 0 }}>{description}</p> : null}
      {children}
    </section>
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

  return (
    <main style={shellStyles.page}>
      <section style={shellStyles.hero}>
        <article style={{ ...shellStyles.panel, padding: 32 }}>
          <p style={{ margin: 0, color: "#0f766e", fontWeight: 700, letterSpacing: 1 }}>MICROFRONTEND CONTROL PLANE</p>
          <h1 style={{ fontSize: 46, lineHeight: 1.05, marginBottom: 10 }}>Production-style host shell with authenticated shared state.</h1>
          <p style={{ ...shellStyles.muted, fontSize: 17, maxWidth: 650 }}>
            Signed in as <strong>{currentUser ? currentUser.name : "..."}</strong>. Redux keeps session state stable across reloads,
            while React Query owns API caching, revalidation, and mutation refreshes.
          </p>
        </article>

        <article style={shellStyles.panel}>
          <p style={{ marginTop: 0, color: "#475569" }}>Session</p>
          <h2 style={{ marginTop: 0 }}>{currentUser ? currentUser.email : "Loading..."}</h2>
          <p style={shellStyles.muted}>JWT-backed access is required for user activity and product creation.</p>
          <button type="button" onClick={handleLogout} style={shellStyles.secondaryButton}>
            Sign out
          </button>
          {notice ? <p style={{ color: "#0f766e", fontWeight: 700 }}>{notice}</p> : null}
        </article>
      </section>

      <section style={shellStyles.stats}>
        <DashboardStat label="Users" value={counts.users} tone="rgba(224, 242, 254, 0.9)" />
        <DashboardStat label="Products" value={counts.products} tone="rgba(254, 243, 199, 0.9)" />
        <DashboardStat label="Events" value={counts.activity} tone="rgba(220, 252, 231, 0.9)" />
      </section>

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

      <section style={shellStyles.cards}>
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

      <section style={{ marginTop: 24 }}>
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

      <section style={{ marginTop: 24 }}>
        <QuerySection title="Remote Catalog" description="The federated remote stays presentational and receives product data from the host shell.">
          {productsQuery.isLoading ? (
            <p>Loading products...</p>
          ) : productsQuery.error ? (
            <p style={{ color: "#b91c1c" }}>{productsQuery.error.message}</p>
          ) : (
            <Suspense fallback={<p>Loading remote catalog...</p>}>
              <RemoteProductCatalog items={productsQuery.data} title="Live catalog from host state" />
            </Suspense>
          )}
        </QuerySection>
      </section>

      <section style={{ marginTop: 24 }}>
        <QuerySection title="State Sharing Demo" description="Remote component accessing shared Redux state directly from host.">
          <Suspense fallback={<p>Loading state sharing demo...</p>}>
            <RemoteStateSharingDemo />
          </Suspense>
        </QuerySection>
      </section>
    </main>
  );
}

export default function App() {
  const token = useSelector((state) => state.auth.token);

  return token ? <Dashboard /> : <AuthScreen />;
}
