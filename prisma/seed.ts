import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const neonAdapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: neonAdapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "SEKRETARIS", input: false },
      isActive: { type: "boolean", required: true, defaultValue: true, input: false },
      sekolahId: { type: "string", required: false, input: false },
    },
  },
});

async function main() {
  // Buat user developer via better-auth API internal
  const ctx = await auth.api.signUpEmail({
    body: {
      name: "Haruki",
      email: "developer@kiharuworks.my.id",
      password: "haqqi123",
    },
  });

  // Update role jadi DEVELOPER
  await prisma.user.update({
    where: { email: "developer@kiharuworks.my.id" },
    data: { role: "DEVELOPER" },
  });

  console.log("✅ Developer user created:");
  console.log("   Email   : developer@kiharuworks.my.id");
  console.log("   Password: haqqi123");
  console.log("   Role    : DEVELOPER");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
