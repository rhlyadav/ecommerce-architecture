const { prisma } = require("./db");

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
}

async function createUser({ name, email, passwordHash }) {
  try {
    if (!name || !email || !passwordHash) {
      throw new Error("name, email, and passwordHash are required");
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  } catch (error) {
    console.error("Failed to create user", error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    return prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Failed to find user by email", error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    console.error("Failed to fetch user by id", error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  createUser,
  findUserByEmail,
  getUserById
};
