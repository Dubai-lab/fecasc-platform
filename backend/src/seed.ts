import "dotenv/config";
import { prisma } from "./lib/prisma.js";

async function main() {
  const services = [
    { title: "Environmental Impact Assessment (EIA)" },
    { title: "Occupational Health & Safety (OHSE)" },
    { title: "Risk Assessment & Management" },
    { title: "Wetland Management" },
    { title: "Climate Mitigation Projects" },
    { title: "Waste Management" },
    { title: "Monitoring & Evaluation (M&E)" },
    { title: "Environmental Eco-Auditing & Project Management" },
    { title: "Solar Installation & Maintenance" },
    { title: "Solar Panel Distribution & Maintenance" },
    { title: "House Plan & Estimate" },
    { title: "Residential Wiring" },
    { title: "Training for Public & Private Employees" }
  ];

  for (const s of services) {
    // First try to find by title, then update or create
    const existing = await prisma.service.findFirst({
      where: { title: s.title },
    });
    
    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    } else {
      await prisma.service.create({
        data: { title: s.title, isActive: true },
      });
    }
  }

  console.log("✅ Services seeded");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
