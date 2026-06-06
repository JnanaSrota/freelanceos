async function loadInvoicesPage() {
  await loadClients()
  const res = await fetch(`${API}/invoices/`, { headers: authHeaders() })
  const invoices = await res.json()
  const tbody = document.getElementById('invoices-table')
  tbody.innerHTML = invoices.map(i => `
    <tr>
      <td>${i.invoice_number}</td>
      <td>${i.client_id}</td>
      <td>₹${i.subtotal.toLocaleString('en-IN')}</td>
      <td>₹${(i.cgst + i.sgst + i.igst).toLocaleString('en-IN')}</td>
      <td>₹${i.tds_deducted.toLocaleString('en-IN')}</td>
      <td>₹${i.total_payable.toLocaleString('en-IN')}</td>
      <td><span class="badge badge-${i.status}">${i.status}</span></td>
      <td style="display:flex;gap:6px;">
        <button class="btn-secondary" onclick="downloadPDF(${i.id}, '${i.invoice_number}')">PDF</button>
        ${i.status === 'unpaid' ? `<button class="btn-primary" style="padding:6px 12px;font-size:12px;" onclick="markPaid(${i.id})">Mark Paid</button>` : ''}
      </td>
    </tr>
  `).join('')
}

function addItemRow() {
  const container = document.getElementById('inv-items')
  const row = document.createElement('div')
  row.className = 'form-row inv-item'
  row.innerHTML = `
    <input type="text" placeholder="Description" class="item-desc" />
    <input type="number" placeholder="Qty" class="item-qty" />
    <input type="number" placeholder="Rate (₹)" class="item-rate" />
  `
  container.appendChild(row)
}

async function createInvoice() {
  const client_id = parseInt(document.getElementById('inv-client').value)
  const invoice_date = document.getElementById('inv-date').value
  const due_date = document.getElementById('inv-due').value

  const rows = document.querySelectorAll('.inv-item')
  const items = []
  rows.forEach(row => {
    const desc = row.querySelector('.item-desc').value
    const qty = parseFloat(row.querySelector('.item-qty').value)
    const rate = parseFloat(row.querySelector('.item-rate').value)
    if (desc && qty && rate) {
      items.push({ description: desc, quantity: qty, rate: rate, sac_code: '998314' })
    }
  })

  if (!client_id || !invoice_date || !due_date || items.length === 0) {
    alert('Please fill all fields and add at least one item')
    return
  }

  const res = await fetch(`${API}/invoices/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ client_id, invoice_date, due_date, items })
  })

  const data = await res.json()
  if (res.ok) {
    alert(`Invoice ${data.invoice_number} created! Total Payable: ₹${data.total_payable}`)
    document.getElementById('inv-date').value = ''
    document.getElementById('inv-due').value = ''
    document.querySelectorAll('.inv-item').forEach((r, i) => {
      if (i > 0) r.remove()
      else {
        r.querySelector('.item-desc').value = ''
        r.querySelector('.item-qty').value = ''
        r.querySelector('.item-rate').value = ''
      }
    })
    loadInvoicesPage()
  } else {
    alert(data.detail)
  }
}

async function downloadPDF(id, number) {
  const res = await fetch(`${API}/invoices/${id}/pdf`, { headers: authHeaders() })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${number}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

async function markPaid(id) {
  await fetch(`${API}/invoices/${id}/mark-paid`, {
    method: 'PATCH',
    headers: authHeaders()
  })
  loadInvoicesPage()
}