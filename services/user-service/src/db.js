const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully");
  } catch (error) {
    console.error("Prisma connection failed", error);
    throw error;
  }
}

async function getDatabaseStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch (error) {
    return "error";
  }
}

module.exports = {
  prisma,
  connectDatabase,
  getDatabaseStatus
};
