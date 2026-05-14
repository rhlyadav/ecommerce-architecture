import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { io } from "socket.io-client";
import { listConversation } from "./api";
import { chatSocketUrl } from "./config";

const chatStyles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
    gap: 18,
    minHeight: 420,
    width: "100%",
    minWidth: 0
  },
  sidebar: {
    borderRight: "1px solid #e2e8f0",
    paddingRight: 18,
    minWidth: 0
  },
  userButton: {
    width: "100%",
    minWidth: 0,
    textAlign: "left",
    border: "1px solid #dbe4f0",
    borderRadius: 8,
    padding: "12px 14px",
    background: "#fff",
    cursor: "pointer",
    overflowWrap: "anywhere"
  },
  activeUserButton: {
    background: "#0f766e",
    color: "#fff",
    borderColor: "#0f766e"
  },
  messages: {
    display: "grid",
    gap: 12,
    alignContent: "start",
    maxHeight: 360,
    overflowY: "auto",
    paddingRight: 6,
    minWidth: 0
  },
  bubble: {
    maxWidth: "78%",
    padding: "12px 14px",
    borderRadius: 8,
    lineHeight: 1.45,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    overflowWrap: "anywhere"
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    marginTop: 16,
    minWidth: 0
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
  button: {
    border: 0,
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    background: "#0f766e",
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  muted: {
    color: "#475569"
  }
};

function formatMessage(message) {
  return {
    ...message,
    id: message.id || String(message._id)
  };
}

function appendMessage(messages, incomingMessage) {
  const normalized = formatMessage(incomingMessage);

  if (messages.some((message) => message.id === normalized.id)) {
    return messages;
  }

  return [...messages, normalized];
}

export default function Chat({ token, currentUser, users, showNotice }) {
  const theme = useTheme();
  const isTabletOrDown = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const [activeUserId, setActiveUserId] = useState(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const socketRef = useRef(null);
  const activeUsers = useMemo(
    () => users.filter((user) => Number(user.id) !== Number(currentUser?.id)),
    [currentUser?.id, users]
  );
  const selectedUser = useMemo(
    () => activeUsers.find((user) => Number(user.id) === Number(activeUserId)) || null,
    [activeUserId, activeUsers]
  );

  useEffect(() => {
    if (!activeUserId && activeUsers.length > 0) {
      setActiveUserId(activeUsers[0].id);
    }
  }, [activeUserId, activeUsers]);

  const conversationQuery = useQuery({
    queryKey: ["chat", "conversation", activeUserId, token],
    queryFn: async () => {
      const messages = await listConversation(activeUserId, token);
      return messages.map(formatMessage);
    },
    enabled: Boolean(token && activeUserId),
    staleTime: 0
  });

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(chatSocketUrl, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("chat:message", (message) => {
      const participants = [Number(message.senderId), Number(message.recipientId)];

      if (!participants.includes(Number(currentUser?.id))) {
        return;
      }

      const otherUserId = participants.find((participantId) => participantId !== Number(currentUser?.id));

      queryClient.setQueryData(["chat", "conversation", otherUserId, token], (current = []) => appendMessage(current, message));
    });

    socket.on("connect", () => {
      setSendError("");
    });

    socket.on("connect_error", (error) => {
      setSendError(error.message || "Chat connection failed");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.id, queryClient, token]);

  function handleSend(event) {
    event.preventDefault();

    const body = draft.trim();

    if (!selectedUser || !body || !socketRef.current) {
      return;
    }

    setSendError("");
    socketRef.current.emit("chat:send", { recipientId: selectedUser.id, body }, (response) => {
      if (!response?.ok) {
        setSendError(response?.message || "Failed to send message");
        return;
      }

      setDraft("");
      showNotice(`Message sent to ${selectedUser.name}.`);
    });
  }

  if (activeUsers.length === 0) {
    return <p style={chatStyles.muted}>Create another user first, then sign into two accounts in separate browser sessions to test chat.</p>;
  }

  return (
    <section
      style={{
        ...chatStyles.shell,
        gridTemplateColumns: isTabletOrDown ? "1fr" : chatStyles.shell.gridTemplateColumns,
        gap: isMobile ? 12 : chatStyles.shell.gap
      }}
    >
      <aside
        style={{
          ...chatStyles.sidebar,
          borderRight: isTabletOrDown ? 0 : chatStyles.sidebar.borderRight,
          borderBottom: isTabletOrDown ? "1px solid #e2e8f0" : 0,
          paddingRight: isTabletOrDown ? 0 : chatStyles.sidebar.paddingRight,
          paddingBottom: isTabletOrDown ? 12 : 0
        }}
      >
        <h3 style={{ marginTop: 0 }}>People</h3>
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: isMobile ? "1fr" : isTabletOrDown ? "repeat(2, minmax(0, 1fr))" : "1fr"
          }}
        >
          {activeUsers.map((user) => {
            const isActive = Number(user.id) === Number(activeUserId);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setActiveUserId(user.id)}
                style={{
                  ...chatStyles.userButton,
                  ...(isActive ? chatStyles.activeUserButton : {})
                }}
              >
                <strong>{user.name}</strong>
                <div style={{ opacity: isActive ? 0.9 : 0.7, marginTop: 4, overflowWrap: "anywhere" }}>{user.email}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <h3 style={{ marginTop: 0 }}>{selectedUser ? `Chat with ${selectedUser.name}` : "Select a user"}</h3>
        <p style={{ ...chatStyles.muted, marginTop: 0 }}>
          Open a second browser window, sign in as another account, and messages will appear live for both users.
        </p>

        {conversationQuery.isLoading ? (
          <p>Loading messages...</p>
        ) : conversationQuery.error ? (
          <p style={{ color: "#b91c1c" }}>{conversationQuery.error.message}</p>
        ) : !conversationQuery.data || conversationQuery.data.length === 0 ? (
          <p style={chatStyles.muted}>No messages yet. Start the conversation.</p>
        ) : (
          <div style={{ ...chatStyles.messages, maxHeight: isMobile ? 300 : chatStyles.messages.maxHeight }}>
            {conversationQuery.data.map((message) => {
              const isOwn = Number(message.senderId) === Number(currentUser?.id);

              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: isOwn ? "flex-end" : "flex-start"
                  }}
                >
                  <article
                    style={{
                      ...chatStyles.bubble,
                      maxWidth: isMobile ? "92%" : chatStyles.bubble.maxWidth,
                      background: isOwn ? "#0f766e" : "rgba(226, 232, 240, 0.85)",
                      color: isOwn ? "#fff" : "#0f172a"
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: 6 }}>{isOwn ? "You" : message.senderName}</strong>
                    <div>{message.body}</div>
                    <small style={{ display: "block", marginTop: 8, opacity: 0.8 }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                  </article>
                </div>
              );
            })}
          </div>
        )}

        <form
          onSubmit={handleSend}
          style={{
            ...chatStyles.inputRow,
            gridTemplateColumns: isMobile ? "1fr" : chatStyles.inputRow.gridTemplateColumns
          }}
        >
          <input
            placeholder={selectedUser ? `Write to ${selectedUser.name}` : "Choose a user"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            style={chatStyles.input}
            disabled={!selectedUser}
          />
          <button type="submit" style={chatStyles.button} disabled={!selectedUser || !draft.trim()}>
            Send
          </button>
        </form>
        {sendError ? <p style={{ color: "#b91c1c", marginBottom: 0 }}>{sendError}</p> : null}
      </div>
    </section>
  );
}
