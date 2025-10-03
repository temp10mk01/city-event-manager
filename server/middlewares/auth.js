// middleware folderis serverio failams, kurie tarpiniai tarp request ir response
// middleware = funkcija kuri apdoroja request ir response objektus, gali juos pakeisti arba nutraukti request-response cikla 

// sis auth.js failas turi autentifikavimo middleware funkcija ir role reikalaujancia middleware funkcija

import jwt from "jsonwebtoken";
import prisma from "../prisma_client/prisma.js";

// autentifikavimo middleware funkcija
export async function auth(req, res, next) {
  const header = req.headers.authorization;
  
  // patikriname ar yra authorization headeris
  if (!header) {
    return res.status(401).json({ error: "truksta authorization header" });
  }
  // patikriname ar headeris prasideda su "Bearer "
  const token = header.split(" ")[1];
  
  try {
    // verifikuojame jwt token
    const payload = jwt.verify(token, process.env.JWT_SECRET || "default-secret-key");
    
    // randame vartotoja duomenu bazeje
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    // manau aisku ka daro
    if (!user) {
      return res.status(401).json({ error: "vartotojas nerastas" });
    }
    
    // pridedam vartotojo info i request objekta
    req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (error) {
    console.error("token verifikavimo klaida:", error);
    return res.status(401).json({ error: "neteisingas token" });
  }
}

// funkcija reikalaujanti specifinio vaidmens
export function requireRole(role) {
  return (req, res, next) => {
    // patikriname ar vartotojas yra autentifikuotas
    if (!req.user) {
      return res.status(401).json({ error: "reikalingas autentifikavimas" });
    }
    
    // patikriname ar vartotojas turi reikalinga vaidmeni
    if (req.user.role !== role) {
      return res.status(403).json({ error: "nepakankamos teises" });
    }
    
    next();
  };
}
