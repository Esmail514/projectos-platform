const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with default projects and tables...");

  // 1. Create a flagship project
  const project = await prisma.project.upsert({
    where: { slug: "ecommerce-core" },
    update: {},
    create: {
      name: "Ecommerce Core & Retail API",
      slug: "ecommerce-core",
      description: "منصة التجارة الإلكترونية وإدارة المنتجات والمخزون مع توليد REST APIs تلقائي",
      dbType: "postgresql",
      status: "active",
    },
  });

  // 2. Create products table
  const productsTable = await prisma.tableSchema.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: "products",
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: "products",
      displayName: "المنتجات (Products Catalog)",
      description: "قائمة المنتجات والأسعار والمخزون",
      columns: {
        create: [
          { name: "title", displayName: "اسم المنتج", type: "string", isRequired: true },
          { name: "price", displayName: "السعر ($)", type: "number", isRequired: true },
          { name: "stock", displayName: "الكمية المتاحة", type: "number", isRequired: true },
          { name: "is_featured", displayName: "مميز", type: "boolean", isRequired: false },
        ],
      },
    },
  });

  // 3. Add sample records
  const sampleProducts = [
    { title: "MacBook Pro M3 Max", price: 3499, stock: 12, is_featured: true },
    { title: "Dell UltraSharp 32 4K Monitor", price: 899, stock: 25, is_featured: false },
    { title: "Keychron Q1 Pro Mechanical Keyboard", price: 199, stock: 45, is_featured: true },
    { title: "Sony WH-1000XM5 Noise Cancelling Headphones", price: 399, stock: 30, is_featured: true },
  ];

  for (const prod of sampleProducts) {
    await prisma.recordRow.create({
      data: {
        tableId: productsTable.id,
        data: JSON.stringify(prod),
      },
    });
  }

  // 4. Create an audit log
  await prisma.auditLog.create({
    data: {
      projectId: project.id,
      action: "SYSTEM_INITIALIZED",
      target: "ProjectOS Core",
      details: "Seed data initialized with products table and sample records",
    },
  });

  // 5. Create default alert config
  await prisma.alertConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      cpuThreshold: 85,
      isTelegramEnabled: false,
      isDiscordEnabled: false,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
