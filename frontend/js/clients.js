async function loadClients() {
  const res = await fetch(`${API}/clients/`, { headers: authHeaders() })
  const clients = await res.json()
  const tbody = document.getElementById('clients-table')
  tbody.innerHTML = clients.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.gstin || '—'}</td>
      <td>${c.state_code || '—'}</td>
      <td>${c.tds_applicable ? '✅' : '—'}</td>
      <td>
        <button class="btn-danger" onclick="deleteClient(${c.id})">Delete</button>
      </td>
    </tr>
  `).join('')

  // Also populate invoice client dropdown
  const select = document.getElementById('inv-client')
  if (select) {
    select.innerHTML = clients.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('')
  }
}

async function addClient() {
  const body = {
    name: document.getElementById('c-name').value,
    email: document.getElementById('c-email').value,
    gstin: document.getElementById('c-gstin').value || null,
    state_code: document.getElementById('c-state').value || null,
    is_foreign: document.getElementById('c-foreign').checked,
    tds_applicable: document.getElementById('c-tds').checked
  }
  const res = await fetch(`${API}/clients/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  })
  if (res.ok) {
    document.getElementById('c-name').value = ''
    document.getElementById('c-email').value = ''
    document.getElementById('c-gstin').value = ''
    document.getElementById('c-state').value = ''
    document.getElementById('c-foreign').checked = false
    document.getElementById('c-tds').checked = false
    loadClients()
  } else {
    const data = await res.json()
    alert(data.detail)
  }
}

async function deleteClient(id) {
  if (!confirm('Delete this client?')) return
  await fetch(`${API}/clients/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  loadClients()
}