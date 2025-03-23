import { apiClient } from './client';

export interface Supplier {
  supplier_id: number;
  name: string;
  contact_info: string | null;
}

export interface CreateSupplierPayload {
  name: string;
  contact_info?: string;
}

export interface UpdateSupplierPayload {
  name: string;
  contact_info: string;
}

export interface PartialUpdateSupplierPayload {
  name?: string;
  contact_info?: string;
}

export async function getAllSuppliers(authToken: string): Promise<Supplier[]> {
  return apiClient<Supplier[]>('/suppliers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getSupplierById(authToken: string, supplierId: number): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${supplierId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function createSupplier(authToken: string, supplierData: CreateSupplierPayload): Promise<Supplier> {
  return apiClient<Supplier>('/suppliers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  });
}

export async function updateSupplier(authToken: string, supplierId: number, supplierData: UpdateSupplierPayload): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${supplierId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  });
}

export async function partialUpdateSupplier(authToken: string, supplierId: number, supplierData: PartialUpdateSupplierPayload): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${supplierId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  });
}

export async function deleteSupplier(authToken: string, supplierId: number): Promise<void> {
  await apiClient<void>(`/suppliers/${supplierId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
