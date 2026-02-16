# 🚀 DFL - Digital Fashion Leading
## Sistema Gestione Aziendale Interno

Sistema completo per la gestione di **Presenze**, **Foresteria** e **Viaggi aziendali** per Digital Fashion Leading.

---

## 📋 Caratteristiche

✅ **Modulo Presenze**
- Registrazione presenze (ufficio, smart working, cliente)
- Calendario interattivo
- Report e export Excel

✅ **Modulo Foresteria**
- Gestione 3 posti letto
- Sistema prenotazioni con approvazione HR
- Controllo disponibilità real-time

✅ **Modulo Viaggi**
- Richieste trasferte (aereo, treno, taxi, hotel)
- Workflow approvazione Manager
- Budget tracking

✅ **Sistema Admin**
- Dashboard approvazioni
- Report avanzati
- Gestione utenti

✅ **Funzionalità Generali**
- Autenticazione Supabase (email/password + futuro Microsoft SSO)
- 3 ruoli: Admin, Manager, Employee
- Tema chiaro/scuro
- Design responsive

---

## 🛠️ Stack Tecnologico

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: React Query
- **Notifications**: React Hot Toast

---

## 📦 Installazione

### Prerequisiti
- Node.js v18+ ([Download](https://nodejs.org))
- Account Supabase gratuito ([Registrati](https://supabase.com))

### Setup Rapido

1. **Estrai il progetto**
   ```bash
   unzip dfl-app.zip
   cd dfl-app
   ```

2. **Installa dipendenze**
   ```bash
   npm install
   ```

3. **Configura variabili ambiente**
   ```bash
   # Copia .env.example in .env.local
   cp .env.example .env.local
   
   # Modifica .env.local con i tuoi valori Supabase
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
   ```

4. **Avvia app**
   ```bash
   npm run dev
   ```

5. **Apri browser**
   ```
   http://localhost:5173
   ```

---

## ⚙️ Setup Supabase

### 1. Crea Progetto

1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto `dfl-app`
3. Region: `Europe West (Frankfurt)`
4. Salva la password database

### 2. Esegui Schema Database

1. Apri **SQL Editor** in Supabase
2. Copia TUTTO il contenuto di `supabase-schema.sql`
3. **IMPORTANTE**: Modifica l'email admin (linea 216):
   ```sql
   'admin@digitalfashionleading.com', -- METTI LA TUA EMAIL QUI
   ```
4. Clicca **RUN**

### 3. Copia Credenziali

1. Vai su **Project Settings** → **API**
2. Copia:
   - `Project URL`
   - `anon public key`
3. Incolla in `.env.local`

### 4. Abilita Autenticazione Email

1. **Authentication** → **Providers** → **Email**
2. **Disabilita** "Confirm email" (per test)
3. Clicca **Save**

### 5. Crea Utente Test

1. **Authentication** → **Users** → **Add user**
2. Email: `admin@digitalfashionleading.com` (stessa dello schema SQL!)
3. Password: `DFL2026!` (o quella che preferisci)
4. **Auto Confirm User**: ✅ ATTIVO
5. Clicca **Create user**

---

## 🎯 Login e Test

**Credenziali di test:**
- Email: `admin@digitalfashionleading.com`
- Password: `DFL2026!`

Dopo il login dovresti vedere:
- ✅ Dashboard con statistiche
- ✅ Sidebar con navigazione
- ✅ Toggle tema chiaro/scuro funzionante
- ✅ Logout

---

## 📂 Struttura Progetto

```
dfl-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Layout
│   │   ├── common/          # Button, Card, Input, Modal
│   │   └── modules/         # Componenti per ogni modulo
│   ├── pages/               # Dashboard, Presenze, Foresteria, etc.
│   ├── stores/              # Zustand stores (auth, theme)
│   ├── lib/                 # Supabase client
│   ├── utils/               # Helper functions
│   ├── hooks/               # Custom React hooks
│   ├── App.jsx              # Main app con routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind + custom CSS
├── supabase-schema.sql      # Schema database completo
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🎨 Design System

### Colori Principali
- **Primary**: `#000000` (Nero logo DFL)
- **Accent**: `#FF6B6B` (Rosso elegante)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

### Tema Scuro
Supporto completo con toggle istantaneo

---

## 🔐 Ruoli Utente

| Ruolo      | Permessi                                      |
|------------|-----------------------------------------------|
| **Admin**  | Approva foresteria, visualizza tutto, export |
| **Manager**| Approva viaggi, visualizza richieste team    |
| **Employee**| Crea richieste, visualizza solo proprie      |

---

## 🚀 Prossimi Sviluppi

### Sprint 2 (In corso)
- [ ] Calendario interattivo presenze
- [ ] Sistema prenotazione foresteria
- [ ] Form richiesta viaggi

### Sprint 3 (Prossimo)
- [ ] Dashboard approvazioni admin
- [ ] Export Excel/CSV
- [ ] Report avanzati

### Future
- [ ] Microsoft SSO (Azure AD)
- [ ] Notifiche email
- [ ] App mobile (React Native)

---

## 🐛 Troubleshooting

### ❌ "Invalid login credentials"
**Soluzione**: Verifica che l'utente sia stato creato in Supabase con la stessa email dello schema SQL

### ❌ "supabaseUrl is required"
**Soluzione**: Controlla che `.env.local` esista (NON `.env.example`) e contenga i valori corretti

### ❌ Errori npm install
**Soluzione**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ RLS policy error
**Soluzione**: Ricarica lo schema SQL completo in Supabase

---

## 📞 Supporto

Per problemi o richieste:
1. Controlla [SETUP-GUIDE.md](./SETUP-GUIDE.md) per istruzioni dettagliate
2. Verifica la sezione Troubleshooting sopra
3. Contatta il team di sviluppo

---

## 📄 Licenza

© 2026 Digital Fashion Leading - Uso Interno

---

**Buon lavoro! 🎉**
