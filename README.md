# citify app

miesto renginiu valdymo aplikacija sukurta su react ir node.js technologijomis.

## funkcionalumas

- **vartotoju sistema**: registracija, prisijungimas, vaidmenų valdymas
- **renginiu valdymas**: kurimas, redagavimas, salinimas su patvirtinimo sistema
- **ivertinimo sistema**: vartotojai gali vertinti renginius 1-5 zvaigzdutemis
- **administravimas**: administratoriu pultas renginiu, vartotoju ir kategoriju valdymui
- **filtravimas**: renginiai filtruojami pagal kategorijas
- **atsako dizainas**: veikia visuose irenginiuose

## technologijos

### frontend

- **react 19** su vite build įrankiu
- **react router** navigacijai
- **axios** api uzklausoms
- **sass** stilizavimui

### backend

- **node.js** su express framework
- **prisma orm** duomenu bazes valdymui
- **sqlite** duomenu baze
- **jwt** autentifikavimui
- **bcrypt** slaptazodziu kryptavimui

## paleidimo instrukcijos

### 1. projekto atsisiuntimas

```bash
git clone <repository-url>
cd "Citify App"
```



### 2. priklausomybiu idiegimas

**serveriui:**

```bash
cd server
npm install
```

**klientui:**

```bash
cd client
npm install
```

### 3. aplinkos kintamieji

sukurkite `.env` faila `server` kataloge:

```.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="random-saugus-jwt-raktas-cia"
PORT=5000
```

### 4. duomenu bazes paruosimas

```bash
cd server
npx prisma migrate dev --name "init"
npx prisma generate
node prisma/seed.js
```

### 5. serveriu paleidimas

**serveris (5000 portas):**

```bash
cd server
npm run dev
```

**klientas (5173 portas):**

```bash
cd client
npm run dev
```

## pradzios duomenys

seed scriptas sukuria:

### vartotojai:

- **admin**: admin@example.com / AdminPassword123 (administratorius)
- **user**: user@example.com / UserPassword123 (paprastas vartotojas)

### kategorijos:

- muzika
- menas
- teatras
- sportas
- maistas

### renginiai:

- dziazo vakaras (patvirtintas)

### autentifikavimas

- `POST /api/auth/register` - registracija
- `POST /api/auth/login` - prisijungimas

### renginiai

- `GET /api/events` - visi renginiai (su filtrais)
- `GET /api/events/:id` - vienas renginys
- `POST /api/events` - sukurti rengini (reikia auth)
- `PUT /api/events/:id` - redaguoti rengini (reikia auth)
- `DELETE /api/events/:id` - istrinti rengini (reikia auth)
- `POST /api/events/:id/rate` - ivertinti rengini (reikia auth)

### kategorijos

- `GET /api/categories` - visos kategorijos
- `POST /api/categories` - sukurti kategorija (tik admin)
- `DELETE /api/categories/:id` - istrinti kategorija (tik admin)

### administravimas

- `GET /api/admin/events/pending` - laukiantys renginiai (tik admin)
- `POST /api/admin/events/:id/approve` - patvirtinti renginii (tik admin)
- `POST /api/admin/events/:id/reject` - atmesti rengini (tik admin)
- `GET /api/admin/users` - visi vartotojai (tik admin)
- `PUT /api/admin/users/:id/role` - keisti vaidmeni (tik admin)
- `GET /api/admin/stats` - statistikos (tik admin)

## naudojimas

### paprastas vartotojas:

1. registruojasi/prisijungia
2. mato patvirtintus renginius
3. gali filtruoti pagal kategorijas
4. gali vertinti renginius
5. gali kurti savo renginius (laukia patvirtinimo)
6. gali redaguoti/šalinti savo renginius

### administratorius:

1. mato visus funkcionalumus kaip paprastas vartotojas
2. gali patvirtinti/atmesti renginius
3. gali valdyti kategorijas
4. gali keisti vartotoju vaidmenis
5. mato sistemos statistikas, visu (ne)patvirtintu renginiu turini

## klaidu šalinimas

### dazniausios problemos:

**serveris nepasileidizia:**

- patikrinkite ar idiegtos visos priklausomybes
- patikrinkite .env faila
- paleiskite duomenu bazes migracija

**klientas nepasileidzia:**

- patikrinkite ar serveris veikia 5000 porte
- patikrinkite ar vite konfiguraxija teisinga

**prisijungimas neveikia:**

- patikrinkite ar paleistas seed scriptas
- naudokite test duomenis is dokumentacijos
