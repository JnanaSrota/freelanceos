<div align="center">

# FreelanceOS

### GST-Compliant Invoicing Platform for Indian Freelancers

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**The only invoicing platform built specifically for Indian freelancers with real GST computation, TDS tracking, advance tax intelligence, and AI-powered invoice generation.**

[Live Demo](https://freelanceos-neon.vercel.app) [Live Demo-React](https://freelanceos-react.vercel.app) · [API Docs](https://freelanceos-sbp6.onrender.com/docs) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Hackathon Submission

**GitHub:** [@JnanaSrota](https://github.com/JnanaSrota)
**Repo:** https://github.com/JnanaSrota/freelanceos
**Live:** https://freelanceos-neon.vercel.app
**API Docs:** https://freelanceos-sbp6.onrender.com/docs

---

## Inspiration

I'm a 19-year-old CS student in Mumbai who started freelancing to build financial independence before my degree ends. The first time a client deducted TDS from my payment I had no idea what it was, why it happened, or how it affected my taxes.

I asked around — every freelancer I knew had the same confusion. Most were sending Word document invoices with wrong GST treatment or paying a CA ₹5,000 a year to do something mechanical.

I looked for a tool that understood Indian tax law — CGST vs IGST, Section 194J TDS, advance tax quarters -- and found nothing. Every product was built for the West. So I built it myself.

FreelanceOS is the tool I wish existed when I got my first freelance payment.

---

## The Problem

India has **8+ million freelancers**. Every single one faces the same nightmare:

- Sending invoices with wrong GST treatment — CGST/SGST vs IGST vs zero-rated export
- Getting TDS deducted under Section 194J and never reconciling it against actual tax liability
- Missing advance tax deadlines (June 15, Sept 15, Dec 15, March 15) and paying interest under 234B/234C
- Paying CAs ₹3–5k/year for something that should be fully automated

Tools like HoneyBook, Bonsai, and Dubsado don't understand Indian tax law.
Indian alternatives don't exist at this quality level.

**FreelanceOS fixes all of this.**

---

## Features

### AI Invoice Assistant
- Type naturally: *"Invoice Rahul for 3 weeks React work at 15,000 per week"*
- Powered by Llama 3.1 via Groq — auto-fills client, description, quantity, and rate
- Fastest path from thought to GST-compliant invoice

### GST-Compliant Invoice Engine
- Intrastate — auto-computes CGST 9% + SGST 9%
- Interstate — auto-computes IGST 18%
- Foreign clients — zero-rated supply with "Export of Services" declaration
- Professional PDF generation with correct SAC codes (998314 / 998313)
- Indian FY-aware invoice numbering: `PS/2026-27/001` — resets every April 1

### TDS Tracker
- Auto-deducts 10% TDS under Section 194J for applicable clients
- Running TDS credit balance across the financial year
- Full reconciliation against advance tax liability

### Advance Tax Dashboard
- Real-time tax liability estimate based on FY income
- New tax regime slab computation (FY 2026-27)
- Quarterly shortfall warnings before deadlines hit
- Log advance tax payments with challan numbers

### Client Management
- Store GSTIN, state code, TDS applicability per client
- B2B vs B2C invoice handling
- Foreign client detection with automatic zero-rating

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL via Supabase |
| Frontend | Vanilla JS |
| Auth | JWT (python-jose + bcrypt) |
| AI | Llama 3.1 via Groq API |
| PDF Engine | WeasyPrint + Jinja2 |
| API Hosting | Render |
| Frontend Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL or Supabase account
- Git Bash

### Installation

```bash
# Clone the repo
git clone https://github.com/JnanaSrota/freelanceos.git
cd freelanceos

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
uvicorn app.main:app --reload
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Access

| Service | URL |
|---|---|
| Frontend | http://localhost:8000/app |
| API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## API Overview

```
POST   /auth/register           Register account
POST   /auth/login              Get JWT token

GET    /clients/                List clients
POST   /clients/                Add client
DELETE /clients/{id}            Remove client

POST   /invoices/               Create invoice (auto-computes GST + TDS)
GET    /invoices/               List all invoices
GET    /invoices/{id}/pdf       Download invoice as PDF
PATCH  /invoices/{id}/mark-paid Mark invoice paid

GET    /tax/summary             Advance tax dashboard
POST   /tax/payment             Log advance tax payment

POST   /ai/parse-invoice        Natural language invoice parsing
```

---

## GST Logic

```python
# Intrastate (same state as freelancer)
CGST = subtotal x 9%
SGST = subtotal x 9%

# Interstate (different state)
IGST = subtotal x 18%

# Foreign client (export of services)
GST = 0  # Zero-rated under LUT route

# TDS (Section 194J — applicable Indian companies)
TDS = subtotal x 10%
Amount received = Gross - TDS
```

---

## Project Structure

```
freelanceos/
├── app/
│   ├── main.py               FastAPI app + router registration
│   ├── models.py             SQLAlchemy models
│   ├── database.py           DB connection + session
│   ├── auth.py               Register + Login
│   ├── clients.py            Client CRUD
│   ├── invoices.py           Invoice creation + PDF
│   ├── gst.py                GST computation engine
│   ├── invoice_number.py     FY-aware invoice numbering
│   ├── tax.py                Advance tax calculator
│   ├── ai.py                 Groq AI invoice parser
│   ├── dependencies.py       JWT auth dependency
│   └── templates/
│       └── invoice.html      PDF invoice template
├── frontend/
│   ├── index.html            Login / Register
│   ├── dashboard.html        Main app dashboard
│   ├── css/style.css
│   └── js/
│       ├── auth.js
│       ├── clients.js
│       ├── invoices.js
│       └── tax.js
├── requirements.txt
├── .env.example
└── README.md
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://freelanceos-neon.vercel.app |
| API | Render | https://freelanceos-sbp6.onrender.com |
| Database | Supabase | PostgreSQL (Singapore region) |

---

## Roadmap

- [x] GST-compliant invoice generation (CGST/SGST/IGST/Zero-rated)
- [x] TDS tracking under Section 194J
- [x] Advance tax calculator with quarterly deadlines
- [x] Professional PDF download
- [x] Multi-tenant JWT authentication
- [x] AI natural language invoice creation (Groq + Llama 3.1)
- [ ] Email invoice directly to client
- [ ] Client payment reminders
- [ ] GSTR-1 ready export
- [ ] React frontend with advanced dashboard

---

## Built By

**Prince Pal** — Mumbai
GitHub: [@JnanaSrota](https://github.com/JnanaSrota)

> "Every Indian freelancer deserves accounting software that actually understands Indian taxes."

---

## License

MIT — use it, fork it, build on it.

---

<div align="center">
If this helped you, leave a star. It means a lot.
</div>
