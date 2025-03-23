import { apiClient } from './client';

export interface Transaction {
  transaction_id: number;
  product_id: number;
  transaction_type: 'Delivery' | 'Pull-out' | 'Sale' | 'Return';
  quantity: number;
  transaction_date: string; // ISO 8601 format
  supplier_id: number | null;
  user_id: number;
  price: number | null;
}

export interface CreateTransactionPayload {
  product_id: number;
  transaction_type: 'Delivery' | 'Pull-out' | 'Sale' | 'Return';
  quantity: number;
  transaction_date: string;
  supplier_id?: number | null; // Optional, depending on transaction type
  user_id: number;
  price?: number | null; // Optional, depending on transaction type
}

export async function getAllTransactions(authToken: string): Promise<Transaction[]> {
  return apiClient<Transaction[]>('/transactions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getTransactionById(authToken: string, transactionId: number): Promise<Transaction> {
  return apiClient<Transaction>(`/transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function createTransaction(authToken: string, transactionData: CreateTransactionPayload): Promise<Transaction> {
  return apiClient<Transaction>('/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
}
