export interface Client {
  id: string;
  name: string;
  email: string;
  gstin?: string;
  state: string; // e.g., "27" for Maharashtra, "07" for Delhi
  isForeign: boolean;
  tdsApplicable: boolean;
  createdDate: string;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'draft' | 'overdue';

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number; // e.g., 0.18 for 18%
  gstAmount: number; // Calculated
  tdsRate: number; // e.g., 0.10 for 10%
  tdsAmount: number; // Calculated
  status: InvoiceStatus;
  notes?: string;
  tdsDeducted?: number;
cgst?: number;
sgst?: number;
igst?: number;
totalPayable: number;
}

export interface TaxPayment {
  id: string;
  amount: number;
  challanNumber: string;
  paymentDate: string;
  quarter: string; // e.g., "Q1", "Q2", "Q3", "Q4"
}

export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'pending' | 'verified';
  type: 'PAN' | 'GSTIN' | 'BANK' | 'LUT';
}
