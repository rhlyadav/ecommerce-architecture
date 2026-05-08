const { configureStore, createSlice } = require("@reduxjs/toolkit");
const axios = require("axios");

const STORAGE_KEY = "commerce-auth";
const AUTH_STATUS = {
  AUTHENTICATED: "authenticated",
  ANONYMOUS: "anonymous"
};

const INITIAL_UI_STATE = {
  notice: ""
};

function isBrowser() {
  return typeof window !== "undefined";
}

function parseJSON(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function readAuthFromStorage() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? parseJSON(raw) : null;
}

function writeAuthToStorage(authState) {
  if (!isBrowser()) {
    return;
  }

  if (authState.token && authState.user) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: authState.token,
        user: authState.user
      })
    );
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function createInitialAuthState() {
  const persistedAuth = readAuthFromStorage();

  if (!persistedAuth || !persistedAuth.token) {
    return {
      token: "",
      user: null,
      status: AUTH_STATUS.ANONYMOUS
    };
  }

  return {
    token: persistedAuth.token,
    user: persistedAuth.user || null,
    status: AUTH_STATUS.AUTHENTICATED
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: createInitialAuthState(),
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = AUTH_STATUS.AUTHENTICATED;
    },
    clearCredentials(state) {
      state.token = "";
      state.user = null;
      state.status = AUTH_STATUS.ANONYMOUS;
    },
    syncUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS;
    }
  }
});

const uiSlice = createSlice({
  name: "ui",
  initialState: INITIAL_UI_STATE,
  reducers: {
    showNotice(state, action) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = "";
    }
  }
});

const apiClient = axios.create();

function syncApiClientToken(token) {
  if (!token) {
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer
  }
});

let previousToken = store.getState().auth.token;
syncApiClientToken(previousToken);

store.subscribe(() => {
  const { auth } = store.getState();
  writeAuthToStorage(auth);

  if (auth.token !== previousToken) {
    previousToken = auth.token;
    syncApiClientToken(auth.token);
  }
});

module.exports = {
  store,
  apiClient,
  authActions: authSlice.actions,
  uiActions: uiSlice.actions
};
