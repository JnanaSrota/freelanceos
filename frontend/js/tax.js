async function loadTax() {
  const res = await fetch(`${API}/tax/summary`, { headers: authHeaders() })
  const data = await res.json()

  document.getElementById('tax-gross').textContent = `₹${data.gross_income_ytd.toLocaleString('en-IN')}`
  document.getElementById('tax-liability').textContent = `₹${data.estimated_annual_tax.toLocaleString('en-IN')}`
  document.getElementById('tax-shortfall').textContent = `₹${data.shortfall.toLocaleString('en-IN')}`

  const tbody = document.getElementById('tax-table')
  tbody.innerHTML = `
    <tr><td>Gross Income (FY)</td><td>₹${data.gross_income_ytd.toLocaleString('en-IN')}</td></tr>
    <tr><td>Estimated Expenses (30%)</td><td>— ₹${data.estimated_expenses.toLocaleString('en-IN')}</td></tr>
    <tr><td>Taxable Income</td><td>₹${data.taxable_income.toLocaleString('en-IN')}</td></tr>
    <tr><td>Estimated Annual Tax</td><td>₹${data.estimated_annual_tax.toLocaleString('en-IN')}</td></tr>
    <tr><td>TDS Already Credited</td><td>— ₹${data.tds_credited.toLocaleString('en-IN')}</td></tr>
    <tr><td>Net Tax Payable</td><td>₹${data.net_tax_payable.toLocaleString('en-IN')}</td></tr>
    <tr><td>Should Have Paid By Now</td><td>₹${data.should_have_paid_by_now.toLocaleString('en-IN')}</td></tr>
    <tr><td>Actually Paid</td><td>₹${data.actually_paid.toLocaleString('en-IN')}</td></tr>
    <tr style="font-weight:bold;color:#dc2626;"><td>Current Shortfall</td><td>₹${data.shortfall.toLocaleString('en-IN')}</td></tr>
    <tr><td>Next Deadline</td><td>📅 ${data.next_deadline}</td></tr>
  `
}

async function logPayment() {
  const amount = parseFloat(document.getElementById('tax-amount').value)
  const challan = document.getElementById('tax-challan').value

  if (!amount || !challan) {
    alert('Please fill amount and challan number')
    return
  }

  const res = await fetch(`${API}/tax/payment?amount=${amount}&challan=${challan}`, {
    method: 'POST',
    headers: authHeaders()
  })

  if (res.ok) {
    alert('Payment logged successfully')
    document.getElementById('tax-amount').value = ''
    document.getElementById('tax-challan').value = ''
    loadTax()
  } else {
    const data = await res.json()
    alert(data.detail)
  }
}