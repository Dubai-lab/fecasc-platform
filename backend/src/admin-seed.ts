import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import { hashPassword } from "./lib/auth.js";

async function main() {
  const name = "FECASC Admin";
  const email = "admin@fecasc.com";
  const password = "Admin@12345";

  const hashed = await hashPassword(password);

  await prisma.admin.upsert({
    where: { email },
    update: { name, password: hashed },
    create: { name, email, password: hashed },
  });

  console.log("✅ Admin ready:");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
