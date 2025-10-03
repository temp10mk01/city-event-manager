// middleware folderis serverio failams, kurie tarpiniai tarp request ir response
// middleware = funkcija kuri apdoroja request ir response objektus, gali juos pakeisti arba nutraukti request-response cikla 

// si middleware funkcija tikrina ar prisijunges vartotojas turi reikiama role (pvz. ADMIN) kad galetu pasiekti tam tikra route
// naudojama apsaugoti admin routes

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
