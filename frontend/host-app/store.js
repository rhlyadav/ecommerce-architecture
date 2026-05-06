const { configureStore, createSlice } = require("@reduxjs/toolkit");

const storageKey = "commerce-auth";

function loadPersistedAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

const persistedAuth = loadPersistedAuth();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: persistedAuth ? persistedAuth.token : "",
    user: persistedAuth ? persistedAuth.user : null,
    status: persistedAuth && persistedAuth.token ? "authenticated" : "anonymous"
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.token = "";
      state.user = null;
      state.status = "anonymous";
    },
    syncUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
    }
  }
});

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notice: ""
  },
  reducers: {
    showNotice(state, action) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = "";
    }
  }
});

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer
  }
});

store.subscribe(() => {
  if (typeof window === "undefined") {
    return;
  }

  const state = store.getState();

  if (state.auth.token && state.auth.user) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        token: state.auth.token,
        user: state.auth.user
      })
    );
  } else {
    window.localStorage.removeItem(storageKey);
  }
});

module.exports = {
  store,
  authActions: authSlice.actions,
  uiActions: uiSlice.actions
};
