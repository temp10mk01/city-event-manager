import express from "express";
import prisma from "../prisma_client/prisma.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// gaunamos visos kategorijos
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { events: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error("kategoriju gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti kategoriju" });
  }
});

// sukuriama nauja kategorija (tik administratoriams)
router.post("/", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "kategorijos pavadinimas privalomas" });
    }

    // patikriname ar kategorija jau egzistuoja
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res.status(400).json({ error: "kategorija su tokiu pavadinimu jau egzistuoja" });
    }

    const category = await prisma.category.create({ 
      data: { name: name.trim() } 
    });
    res.status(201).json(category);
  } catch (error) {
    console.error("kategorijos kurimo klaida:", error);
    res.status(500).json({ error: "nepavyko sukurti kategorijos" });
  }
});

// trinimo kategorija (tik administratoriams)
router.delete("/:id", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const categoryId = req.params.id;

    // patikriname ar kategorija egzistuoja
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { events: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: "kategorija nerasta" });
    }

    // patikriname ar yra susijusiu renginiu
    if (category._count.events > 0) {
      return res.status(400).json({ 
        error: "negalima istrinti kategorijos, kuri turi susijusiu renginiu" 
      });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.json({ message: "kategorija sėkmingai ištrinta" });
  } catch (error) {
    console.error("kategorijos šalinimo klaida:", error);
    res.status(500).json({ error: "nepavyko istrinti kategorijos" });
  }
});

export default router;
