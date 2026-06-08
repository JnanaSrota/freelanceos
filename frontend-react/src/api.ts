const API = 'https://freelanceos-sbp6.onrender.com'

export function getToken(): string | null {
  return localStorage.getItem('fos_token')
}

export function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

// Auth
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (res.ok) localStorage.setItem('fos_token', data.token)
  return { ok: res.ok, data }
}

export async function registerUser(payload: {
  name: string, email: string, password: string,
  state_code: string, initials: string, gstin?: string
}) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (res.ok) localStorage.setItem('fos_token', data.token)
  return { ok: res.ok, data }
}

// Clients
export async function fetchClients() {
  const res = await fetch(`${API}/clients/`, { headers: authHeaders() })
  return res.json()
}

export async function createClient(payload: object) {
  const res = await fetch(`${API}/clients/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function deleteClient(id: number) {
  await fetch(`${API}/clients/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
}

// Invoices
export async function fetchInvoices() {
  const res = await fetch(`${API}/invoices/`, { headers: authHeaders() })
  return res.json()
}

export async function createInvoice(payload: object) {
  const res = await fetch(`${API}/invoices/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function markInvoicePaid(id: number) {
  await fetch(`${API}/invoices/${id}/mark-paid`, {
    method: 'PATCH',
    headers: authHeaders()
  })
}

export async function downloadInvoicePDF(id: number, invoiceNumber: string) {
  const res = await fetch(`${API}/invoices/${id}/pdf`, { headers: authHeaders() })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${invoiceNumber}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// Tax
export async function fetchTaxSummary() {
  const res = await fetch(`${API}/tax/summary`, { headers: authHeaders() })
  return res.json()
}

export async function logTaxPayment(amount: number, challan: string) {
  await fetch(`${API}/tax/payment?amount=${amount}&challan=${challan}`, {
    method: 'POST',
    headers: authHeaders()
  })
}

// AI
export async function parseInvoiceAI(text: string) {
  const res = await fetch(`${API}/ai/parse-invoice`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text })
  })
  return res.json()
}