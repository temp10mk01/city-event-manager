import express from "express";
import prisma from "../prisma_client/prisma.js";
import { auth } from "../middlewares/auth.js"; 

const router = express.Router();

// gaunami visi renginiai
router.get("/", async (req, res) => {
  try {
    const { approved, category } = req.query;
    
    // sukuriame filtravimo salygas
    const where = {};
    if (approved !== undefined) {
      where.approved = approved === 'true';
    }
    if (category) {
      where.categoryId = category;
    }
    
    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        ratings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // apskaiciuojamas vidutinis ivertinimas
    const eventsWithRating = events.map(event => ({
      ...event,
      averageRating: event.ratings.length > 0 
        ? event.ratings.reduce((sum, rating) => sum + rating.score, 0) / event.ratings.length 
        : 0,
      ratingCount: event.ratings.length
    }));
    
    res.json(eventsWithRating);
  } catch (error) {
    console.error("renginiu gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti renginiu" });
  }
});

// gaunamas vienas renginys pagal id
router.get("/:id", async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { 
        category: true, 
        author: {
          select: { id: true, name: true, email: true }
        },
        ratings: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
    });

    if (!event) {
      return res.status(404).json({ error: "renginys nerastas" });
    }

    // apskaiciuojamas vidutinis ivertinimas
    const averageRating = event.ratings.length > 0 
      ? event.ratings.reduce((sum, rating) => sum + rating.score, 0) / event.ratings.length 
      : 0;

    res.json({
      ...event,
      averageRating,
      ratingCount: event.ratings.length
    });
  } catch (error) {
    console.error("renginio gavimo klaida:", error);
    res.status(500).json({ error: "nepavyko gauti renginio" });
  }
});

// sukuriamas naujas renginys (reikalingas autentifikavimas)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, image, categoryId } = req.body;

    // patikriname privalomus laukus
    if (!title || !description || !startTime || !categoryId) {
      return res.status(400).json({ 
        error: "reikalingi laukai: title, description, startTime, categoryId" 
      });
    }

    // patikriname ar kategorija egzistuoja
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return res.status(400).json({ error: "kategorija nerasta" });
    }

    // prisijunges vartotojas yra autorius
    const authorId = req.user.id;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location || "",
        image: image || null,
        category: { connect: { id: categoryId } },
        author: { connect: { id: authorId } },
        approved: false // pagal nutylejima nepatvirtintas
      },
      include: { 
        category: true, 
        author: {
          select: { id: true, name: true, email: true }
        } 
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("renginio kurimo klaida:", error);
    res.status(500).json({ error: "nepavyko sukurti renginio" });
  }
});

// atnaujinamas renginys
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, image, categoryId } = req.body;
    const eventId = req.params.id;

    // patikriname ar renginys egzistuoja ir ar vartotojas turi teise ji redaguoti
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { author: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "renginys nerastas" });
    }

    // tikrina ar vartotojas yra autorius arba admin
    if (existingEvent.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "neturite teises redaguoti šio renginio" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (categoryId) updateData.category = { connect: { id: categoryId } };

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: { 
        category: true, 
        author: {
          select: { id: true, name: true, email: true }
        } 
      },
    });

    res.json(event);
  } catch (error) {
    console.error("renginio atnaujinimo klaida:", error);
    res.status(500).json({ error: "nepavyko atnaujinti renginio" });
  }
});

// istrinamas renginys
router.delete("/:id", auth, async (req, res) => {
  try {
    const eventId = req.params.id;

    // patikriname ar renginys egzistuoja ir ar vartotojas turi teise ji istrinti
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { author: true }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "renginys nerastas" });
    }

    // tikrina ar vartotojas yra autorius arba admin
    if (existingEvent.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "neturite teises istrinti šio renginio" });
    }

    await prisma.event.delete({ where: { id: eventId } });
    res.json({ message: "renginys sėkmingai ištrintas" });
  } catch (error) {
    console.error("renginio šalinimo klaida:", error);
    res.status(500).json({ error: "nepavyko istrinti renginio" });
  }
});

// ivertinamas renginys
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { score, comment } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    // patikriname ar ivertinimas yra teisingas (1-5)
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: "ivertinimas turi buti nuo 1 iki 5" });
    }

    // patikriname ar renginys egzistuoja
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: "renginys nerastas" });
    }

    // patikriname ar vartotojas jau ivertino šį renginį
    const existingRating = await prisma.rating.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    });

    if (existingRating) {
      // atnaujiname esama ivertinima
      const rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          score: parseInt(score),
          comment: comment || null
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });
      res.json(rating);
    } else {
      // sukuriame nauja ivertinima
      const rating = await prisma.rating.create({
        data: {
          score: parseInt(score),
          comment: comment || null,
          event: { connect: { id: eventId } },
          user: { connect: { id: userId } }
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });
      res.status(201).json(rating);
    }
  } catch (error) {
    console.error("renginio ivertinimo klaida:", error);
    res.status(500).json({ error: "nepavyko ivertinti renginio" });
  }
});

export default router;
