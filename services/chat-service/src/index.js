const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { connectDatabase, getDatabaseStatus } = require("./db");
const { authenticateSocket, requireAuth } = require("./middleware");
const { createMessage, listConversation } = require("./models");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  const status = getDatabaseStatus();
  res.status(status === "ok" ? 200 : 500).json({ service: "chat-service", status });
});

app.get("/api/chat/conversations/:otherUserId", requireAuth, async (req, res) => {
  try {
    const otherUserId = Number(req.params.otherUserId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return res.status(400).json({ message: "A valid user id is required" });
    }

    if (otherUserId === req.auth.user.id) {
      return res.status(400).json({ message: "Choose another user to start chatting" });
    }

    const messages = await listConversation(req.auth.user.id, otherUserId);
    return res.json(messages);
  } catch (error) {
    console.error("Failed to fetch conversation", error);
    return res.status(500).json({ message: "Failed to fetch conversation" });
  }
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);

  socket.on("chat:send", async (payload, callback = () => {}) => {
    try {
      const recipientId = Number(payload?.recipientId);
      const body = String(payload?.body || "").trim();

      if (!Number.isInteger(recipientId) || recipientId <= 0) {
        return callback({ ok: false, message: "A valid recipient is required" });
      }

      if (recipientId === socket.user.id) {
        return callback({ ok: false, message: "You cannot send a message to yourself" });
      }

      if (!body) {
        return callback({ ok: false, message: "Message body is required" });
      }

      const message = await createMessage({
        senderId: socket.user.id,
        senderName: socket.user.name,
        recipientId,
        body
      });

      const serializedMessage = {
        id: String(message._id),
        senderId: message.senderId,
        senderName: message.senderName,
        recipientId: message.recipientId,
        body: message.body,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };

      io.to(`user:${socket.user.id}`).to(`user:${recipientId}`).emit("chat:message", serializedMessage);
      return callback({ ok: true, message: serializedMessage });
    } catch (error) {
      console.error("Failed to send message", error);
      return callback({ ok: false, message: "Failed to send message" });
    }
  });
});

async function start() {
  try {
    console.log("Starting chat-service...");
    await connectDatabase();

    server.listen(port, () => {
      console.log(`chat-service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start chat-service", error);
    process.exit(1);
  }
}

start();
