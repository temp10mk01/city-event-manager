import { PrismaClient } from "@prisma/client";

// sis prisma.js failas eksportuoja prisma clienta, kad galetume naudoti kituose failuose ir nereiketu pastoviai deklaruoti nauja prisma klienta

const prisma = new PrismaClient();
export default prisma;
