// Seed Standard ProjectOS Users
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function generateApiKey() {
  return `pos_${crypto.randomBytes(24).toString("hex")}`;
}

async function seed() {
  console.log("--- Seeding ProjectOS Users ---");
  
  // Clean existing sessions and users
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    {
      email: "admin@projectos.io",
      name: "Super Administrator",
      passwordHash: hashPassword("SuperAdmin123!"),
      role: "SUPER_ADMIN",
      apiKey: generateApiKey(),
      isActive: true,
      permissions: null, // Full access by default
    },
    {
      email: "dev@projectos.io",
      name: "Lead Developer",
      passwordHash: hashPassword("DevPassword123!"),
      role: "DEVELOPER",
      apiKey: generateApiKey(),
      isActive: true,
      permissions: null,
    },
    {
      email: "viewer@projectos.io",
      name: "Read-Only Auditor",
      passwordHash: hashPassword("ViewerPassword123!"),
      role: "VIEWER",
      apiKey: generateApiKey(),
      isActive: true,
      permissions: null,
    },
  ];

  for (const u of users) {
    const created = await prisma.user.create({ data: u });
    console.log(`[CREATED] ${created.role}: ${created.email} (API Key: ${created.apiKey})`);
  }

  console.log("\nDefault credentials:");
  console.log("- Super Admin: admin@projectos.io / SuperAdmin123!");
  console.log("- Developer:   dev@projectos.io / DevPassword123!");
  console.log("- Viewer:      viewer@projectos.io / ViewerPassword123!");
  
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
