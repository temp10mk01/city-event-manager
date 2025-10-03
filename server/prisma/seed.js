import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// seed.js filas paleidzia pradinius duomenis i duomenu baze

async function main() {
  // sukuriame pradinius duomenis
  const hashed = await bcrypt.hash("AdminPassword123", 10);
  // upsert funkcija sukuria arba atnaujina vartotoja
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashed,
      name: "Site Admin",
      role: "ADMIN",
    },
    select: { id: true },
  });

  const hashedUserPass = await bcrypt.hash("UserPassword123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: hashedUserPass,
      name: "Regular User",
      role: "USER",
    },
    select: { id: true },
  });

  // iskarto ivestos kategorijos 
  const categories = ["Muzika", "Menas", "Teatras", "Sportas", "Maistas"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const music = await prisma.category.findUnique({
    where: { name: "Muzika" },
    select: { id: true },
  });
  const sports = await prisma.category.findUnique({
    where: { name: "Sportas" },
    select: { id: true },
  });

  // sukuriamas renginys
  await prisma.event.create({
    data: {
      title: "Jazz Vakaras",
      description: "Pasimegauk Jazz vakaru tarp lokalaus muzikinio talento garso.",
      location: "Jazz klubas",
      startTime: new Date("2025-10-05T19:00:00.000Z"),
      endTime: new Date("2025-10-05T22:00:00.000Z"),
      category: { connect: { id: music.id } },
      author: { connect: { id: admin.id } },
      approved: true,
    },
  }); 

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
