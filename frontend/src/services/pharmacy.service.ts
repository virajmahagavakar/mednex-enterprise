import { apiClient as api } from './api.client';
import type {
    MedicineDTO,
    SupplierDTO,
    InventoryBatchDTO,
    BatchReceiptRequest,
    PharmacyPrescriptionDTO,
    DispenseRequest,
    PharmacyDashboardStatsDTO
} from './api.types';

export const PharmacyService = {
    // Dashboard
    getDashboardStats: async (): Promise<PharmacyDashboardStatsDTO> => {
        const response = await api.get('/pharmacy/dashboard');
        return response.data;
    },

    // Medicines
    getAllMedicines: async (): Promise<MedicineDTO[]> => {
        const response = await api.get('/pharmacy/inventory/medicines');
        return response.data;
    },
    addMedicine: async (data: Partial<MedicineDTO>): Promise<MedicineDTO> => {
        const response = await api.post('/pharmacy/inventory/medicines', data);
        return response.data;
    },
    getLowStockMedicines: async (): Promise<MedicineDTO[]> => {
        const response = await api.get('/pharmacy/inventory/medicines/low-stock');
        return response.data;
    },

    // Suppliers
    getAllSuppliers: async (): Promise<SupplierDTO[]> => {
        const response = await api.get('/pharmacy/inventory/suppliers');
        return response.data;
    },
    addSupplier: async (data: Partial<SupplierDTO>): Promise<SupplierDTO> => {
        const response = await api.post('/pharmacy/inventory/suppliers', data);
        return response.data;
    },

    // Inventory & Batches
    receiveStock: async (data: BatchReceiptRequest): Promise<InventoryBatchDTO> => {
        const response = await api.post('/pharmacy/inventory/receive-stock', data);
        return response.data;
    },
    getActiveBatches: async (medicineId: string): Promise<InventoryBatchDTO[]> => {
        const response = await api.get(`/pharmacy/inventory/medicines/${medicineId}/batches`);
        return response.data;
    },
    getExpiringSoonBatches: async (daysThreshold: number = 30): Promise<InventoryBatchDTO[]> => {
        const response = await api.get(`/pharmacy/inventory/batches/expiring-soon`, {
            params: { daysThreshold }
        });
        return response.data;
    },

    // Dispensing
    getPendingPrescriptions: async (): Promise<PharmacyPrescriptionDTO[]> => {
        const response = await api.get('/pharmacy/dispense/pending-prescriptions');
        return response.data;
    },
    fulfillPrescription: async (prescriptionId: string, request: DispenseRequest): Promise<PharmacyPrescriptionDTO> => {
        const response = await api.post(`/pharmacy/dispense/prescriptions/${prescriptionId}/fulfill`, request);
        return response.data;
    }
};
