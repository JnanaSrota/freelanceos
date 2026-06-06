## GitHub handle
@JnanaSrota

## Project Title
FreelanceOS — GST-Compliant Invoicing Platform for Indian Freelancers

## Project Description
FreelanceOS is a full-stack SaaS platform that solves the 
invoicing and tax nightmare faced by 8+ million Indian 
freelancers. It automatically computes CGST/SGST for 
intrastate clients, IGST for interstate, and zero-rates 
foreign client invoices. It tracks TDS deductions under 
Section 194J, generates professional PDF invoices, and 
includes an advance tax dashboard that warns freelancers 
of quarterly shortfalls before deadlines hit. The AI 
assistant lets you generate a complete GST-compliant 
invoice by just typing naturally — "Invoice Rahul for 
3 weeks React work at 15,000 per week" — and the form 
fills itself.

## Inspiration behind the Project
I'm a 19-year-old CS student in Mumbai who started 
freelancing to build financial independence before my 
degree ends. The first time a client deducted TDS from 
my payment I had no idea what it was, why it happened, 
or how it affected my taxes. I asked around — every 
freelancer I knew had the same confusion. Most were 
either sending Word document invoices with wrong GST 
treatment or paying a CA ₹5,000 a year to do something 
mechanical.

I looked for a tool that understood Indian tax law — 
CGST vs IGST, Section 194J TDS, advance tax quarters — 
and found nothing. Every product was built for the West. 
So I built it myself.

FreelanceOS is the tool I wish existed when I got my 
first freelance payment.

## Tech Stack
Backend: FastAPI (Python) — REST API with JWT 
authentication, GST computation engine, TDS tracking 
logic, and advance tax slab calculator.

Database: PostgreSQL via Supabase — multi-tenant 
architecture with Row Level Security.

Frontend: Vanilla JS — no framework overhead, fast 
load, works on any connection.

AI: Llama 3.1 via Groq API — natural language invoice 
parsing. Type a sentence, get a filled invoice form.

PDF Engine: WeasyPrint + Jinja2 — server-side PDF 
generation with professional invoice template, correct 
SAC codes, and GST breakdown.

Deployment: Render (API) + Vercel (Frontend) + 
Supabase (Database).

## Project Repo
https://github.com/JnanaSrota/freelanceos

## Deployed Site URL
https://freelanceos-neon.vercel.app

## Demo Video
[your YouTube unlisted link]
