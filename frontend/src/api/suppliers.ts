import { API_BASE_URL } from '../config';

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
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch suppliers (${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json() as Supplier[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function getSupplierById(authToken: string, supplierId: number): Promise<Supplier> {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch supplier (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Supplier not found';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Supplier;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function createSupplier(authToken: string, supplierData: CreateSupplierPayload): Promise<Supplier> {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create supplier (${response.status})`;

      if (response.status === 400) {
        errorMessage = 'Missing required fields';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Supplier;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function updateSupplier(authToken: string, supplierId: number, supplierData: UpdateSupplierPayload): Promise<Supplier> {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update supplier (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Supplier not found';
      } else if (response.status === 400) {
        errorMessage = 'Missing required fields';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Supplier;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function partialUpdateSupplier(authToken: string, supplierId: number, supplierData: PartialUpdateSupplierPayload): Promise<Supplier> {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to partially update supplier (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Supplier not found';
      } else if (response.status === 400) {
        errorMessage = 'No valid fields to update';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Supplier;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function deleteSupplier(authToken: string, supplierId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete supplier (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Supplier not found';
      } else if (response.status === 409) {
        errorMessage = 'Cannot delete supplier with associated products or transactions';
      }
       else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}
