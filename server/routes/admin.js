import express from "express";
import prisma from "../prisma_client/prisma.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// patvirtinamas renginys (tik administratoriams)
router.post(
  "/events/:id/approve",
  auth,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const eventId = req.params.id;

      // patikriname ar renginys egzistuoja
      const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent) {
        return res.status(404).json({ error: "renginys nerastas" });
      }

      const event = await prisma.event.update({
        where: { id: eventId },
        data: { approved: true },
        include: {
          category: true,
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(event);
    } catch (error) {
      console.error("renginio patvirtinimo klaida:", error);
      res.status(500).json({ error: "nepavyko patvirtinti renginio" });
    }
  }
);

// Atmesti renginį
router.post(
  "/events/:id/reject",
  auth,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ error: "renginys nerastas" });

      await prisma.event.update({
        where: { id: eventId },
        data: { rejected: true, approved: false },
      });

      res.json({ message: "renginys atmestas" });
    } catch (error) {
      console.error("renginio atmetimo klaida:", error);
      res.status(500).json({ error: "nepavyko atmesti renginio" });
    }
  }
);

// gaunami visi renginiai laukiantys patvirtinimo
router.get("/events/pending", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        approved: false,
        rejected: false, // <-- exclude rejected events
      },
      include: {
        category: true,
          author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(events);
  } catch (error) {
    console.error("laukianciu renginiu gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti laukiančių renginių" });
  }
});

// gaunami visi vartotojai
router.get("/users", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("vartotoju gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti vartotoju" });
  }
});

// keiciamas vartotojo vaidmuo
router.put("/users/:id/role", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return res
        .status(400)
        .json({ error: "neteisingas vaidmuo. galimi: USER, ADMIN" });
    }

    // patikriname ar vartotojas egzistuoja
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "vartotojas nerastas" });
    }

    // neleidziame keisti savo vaidmens
    if (userId === req.user.id) {
      return res.status(400).json({ error: "negalite keisti savo vaidmens" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("vartotojo vaidmens keitimo klaida:", error);
    res.status(500).json({ error: "nepavyko pakeisti vartotojo vaidmens" });
  }
});

// statistikos gavimas
router.get("/stats", auth, requireRole("ADMIN"), async (req, res) => {
  try {
    // Promise.all leidzia vienu metu ivykdyti kelis asinchroninius uzklausimus

    const [
      totalUsers,
      totalEvents,
      approvedEvents,
      pendingEvents,
      totalCategories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.count({ where: { approved: true } }),
      prisma.event.count({ where: { approved: false } }),
      prisma.category.count(),
    ]);

    res.json({
      totalUsers,
      totalEvents,
      approvedEvents,
      pendingEvents,
      totalCategories,
    });
  } catch (error) {
    console.error("statistiku gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti statistiku" });
  }
});

export default router;
