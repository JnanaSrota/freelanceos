const API = 'https://freelanceos-sbp6.onrender.com'

function switchTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none'
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  event.target.classList.add('active')
}

async function login() {
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (res.ok) {
    localStorage.setItem('token', data.token)
    window.location.href = '/app/dashboard.html'
  } else {
    document.getElementById('auth-error').textContent = data.detail
  }
}

async function register() {
  const body = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    initials: document.getElementById('reg-initials').value,
    state_code: document.getElementById('reg-state').value,
    gstin: document.getElementById('reg-gstin').value || null
  }
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (res.ok) {
    localStorage.setItem('token', data.token)
    window.location.href = './dashboard.html'
  } else {
    document.getElementById('auth-error').textContent = data.detail
  }
}