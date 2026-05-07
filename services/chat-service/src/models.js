const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    participantsKey: {
      type: String,
      required: true,
      index: true
    },
    senderId: {
      type: Number,
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    recipientId: {
      type: Number,
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

function buildParticipantsKey(userId, otherUserId) {
  return [Number(userId), Number(otherUserId)].sort((left, right) => left - right).join(":");
}

async function listConversation(userId, otherUserId, limit = 50) {
  return Message.find({
    participantsKey: buildParticipantsKey(userId, otherUserId)
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

async function createMessage({ senderId, senderName, recipientId, body }) {
  return Message.create({
    participantsKey: buildParticipantsKey(senderId, recipientId),
    senderId,
    senderName,
    recipientId,
    body
  });
}

module.exports = {
  Message,
  buildParticipantsKey,
  listConversation,
  createMessage
};
