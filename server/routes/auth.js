import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma_client/prisma.js";

const router = express.Router();

// vartotojo registracija
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // patikriname ar yra reikalingi laukai
  if (!email || !password || !name) {
    return res.status(400).json({ error: "truksta reikalauju lauku" });
  }

  try {
    // sukuriame slaptazodžio hash
    const hashed = await bcrypt.hash(password, 10);

    // sukuriame nauja vartotoja
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: "USER", // nustatome pagrindini vaidmeni
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    res.status(400).json({ error: "el. paštas jau naudojamas" });
  }
});

// vartotojo prisijungimas
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // patikriname ar yra reikalingi laukai
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "truksta el. pašto arba slaptazodzio" });
  }

  try {
    // randame vartotoja pagal el. pašta
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ error: "neteisingi prisijungimo duomenys" });
    }

    // patikriname slaptazodi
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "neteisingi prisijungimo duomenys" });
    }

    // sukuriame jwt token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "default-secret-key",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("prisijungimo klaida:", error);
    res.status(500).json({ error: "serverio klaida" });
  }
});

export default router;
