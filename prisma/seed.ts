import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const neonAdapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: neonAdapter });

async function main() {
  const hashedPassword = await bcrypt.hash("haqqi123", 12);

  const user = await prisma.user.upsert({
    where: { email: "developer@kiharuworks.my.id" },
    update: {
      password: hashedPassword,
      role: "DEVELOPER",
      isActive: true,
    },
    create: {
      name: "Haruki",
      email: "developer@kiharuworks.my.id",
      password: hashedPassword,
      role: "DEVELOPER",
      isActive: true,
    },
  });

  console.log("✅ Developer user seeded:");
  console.log("   Email   :", user.email);
  console.log("   Password: haqqi123");
  console.log("   Role    :", user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
