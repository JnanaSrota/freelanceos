import { Client, Invoice, TaxPayment, VerificationStep } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Stripe Global Inc',
    email: 'billing@stripe.com',
    state: '99', // Foreign / Export
    isForeign: true,
    tdsApplicable: false,
    createdDate: '2026-04-10'
  },
  {
    id: 'c-2',
    name: 'Zerodha Tech Private Limited',
    email: 'finance@zerodha.tech',
    gstin: '29AAACZ1122D1Z5',
    state: '29', // Karnataka
    isForeign: false,
    tdsApplicable: true,
    createdDate: '2026-04-18'
  },
  {
    id: 'c-3',
    name: 'Razorpay Software',
    email: 'accounts@razorpay.com',
    gstin: '27AABCR5544B2ZS',
    state: '27', // Maharashtra
    isForeign: false,
    tdsApplicable: true,
    createdDate: '2026-05-02'
  },
  {
    id: 'c-4',
    name: 'Y-Combinator LLC',
    email: 'invoicing@ycombinator.com',
    state: '99',
    isForeign: true,
    tdsApplicable: false,
    createdDate: '2026-05-15'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'FOS-26-001',
    clientId: 'c-1',
    clientName: 'Stripe Global Inc',
    invoiceDate: '2026-04-15',
    dueDate: '2026-05-15',
    items: [
      { description: 'Q1 Web Platform Development - Stripe Apps', qty: 1, rate: 380000 }
    ],
    subtotal: 380000,
    gstRate: 0, // Export with LUT
    gstAmount: 0,
    tdsRate: 0,
    tdsAmount: 0,
    totalPayable: 380000,
    status: 'paid',
    notes: 'Invoiced in USD equivalent under LUT declaration.'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FOS-26-002',
    clientId: 'c-2',
    clientName: 'Zerodha Tech Private Limited',
    invoiceDate: '2026-04-30',
    dueDate: '2026-05-30',
    items: [
      { description: 'Contract UI/UX Engineering - Design System Audit', qty: 2, rate: 85000 },
      { description: 'Engineering Support - NextJS Migration', qty: 40, rate: 2500 }
    ],
    subtotal: 270000,
    gstRate: 0.18, // 18% standard GST
    gstAmount: 48600,
    tdsRate: 0.10, // 10% standard TDS for professional fees
    tdsAmount: 27000,
    totalPayable: 291600, // 270000 + 48600 - 27000 = 291600
    status: 'paid',
    notes: 'TDS will be credited to PAN in Form 26AS next quarter.'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'FOS-26-003',
    clientId: 'c-3',
    clientName: 'Razorpay Software',
    invoiceDate: '2026-05-10',
    dueDate: '2026-06-10',
    items: [
      { description: 'Consultancy Fees - Express Checkout Design', qty: 1, rate: 150000 }
    ],
    subtotal: 150000,
    gstRate: 0.18,
    gstAmount: 27000,
    tdsRate: 0.10,
    tdsAmount: 15000,
    totalPayable: 162000,
    status: 'unpaid',
    notes: 'Pending customer verification of timesheets.'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'FOS-26-004',
    clientId: 'c-4',
    clientName: 'Y-Combinator LLC',
    invoiceDate: '2026-05-28',
    dueDate: '2026-06-28',
    items: [
      { description: 'SaaS Platform Scalability Strategy Session', qty: 1, rate: 240000 }
    ],
    subtotal: 240000,
    gstRate: 0,
    gstAmount: 0,
    tdsRate: 0,
    tdsAmount: 0,
    totalPayable: 240000,
    status: 'draft',
    notes: 'Draft awaiting approvals.'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'FOS-26-005',
    clientId: 'c-2',
    clientName: 'Zerodha Tech Private Limited',
    invoiceDate: '2026-02-12', // Last Fiscal Year overlap for display diversity
    dueDate: '2026-03-12',
    items: [
      { description: 'Security Compliance Auditing & API Patching', qty: 1, rate: 120000 }
    ],
    subtotal: 120000,
    gstRate: 0.18,
    gstAmount: 21600,
    tdsRate: 0.10,
    tdsAmount: 12000,
    totalPayable: 129600,
    status: 'overdue',
    notes: 'Follow-up sent to finance manager.'
  }
];

export const INITIAL_TAX_PAYMENTS: TaxPayment[] = [
  {
    id: 'tax-1',
    amount: 35000,
    challanNumber: 'CH-20260601-99881',
    paymentDate: '2026-06-01',
    quarter: 'Q1'
  }
];

export const INITIAL_VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: 'v-pan',
    title: 'Income Tax PAN Validation',
    description: 'Verifies your Permanent Account Number with NSDL database for TDS credit claims.',
    status: 'verified',
    type: 'PAN'
  },
  {
    id: 'v-gst',
    title: 'GSTIN Mapping & Filing Status',
    description: 'Enables automatic computation of CGST/SGST/IGST and maps correct GSTR-1 formats.',
    status: 'pending',
    type: 'GSTIN'
  },
  {
    id: 'v-bank',
    title: 'Bank Mandate (e-KYC)',
    description: 'Links an active business bank account and verifies IFSC code for instant client transfers.',
    status: 'verified',
    type: 'BANK'
  },
  {
    id: 'v-lut',
    title: 'Letter of Undertaking (LUT) Submission',
    description: 'Submit GST LUT to issue invoices to foreign clients with 0% tax under export guidelines.',
    status: 'pending',
    type: 'LUT'
  }
];

// Indian State Codes dictionary for GST logic
export const INDIAN_STATES: { [key: string]: string } = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '99': 'Other / Foreign Entity (IGST / LUT)'
};
