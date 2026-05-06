const { prisma } = require("./db");

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return users;
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
}

async function createUser(name, email) {
  try {
    if (!name || !email) {
      throw new Error("name and email are required");
    }

    const user = await prisma.user.create({
      data: { name, email }
    });
    return user;
  } catch (error) {
    console.error("Failed to create user", error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  createUser
};
