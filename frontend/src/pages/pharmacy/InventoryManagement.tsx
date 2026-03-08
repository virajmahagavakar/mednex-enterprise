import React, { useState, useEffect } from 'react';
import { Plus, Store, AlertTriangle } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import type { MedicineDTO, SupplierDTO } from '../../services/api.types';
import toast from 'react-hot-toast';

const InventoryManagement: React.FC = () => {
    const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
    const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState(false);

    // Add Medicine Form
    const [newMedicine, setNewMedicine] = useState({
        name: '', genericName: '', category: '', manufacturer: '', unit: '', minimumStockLevel: 10, requiresPrescription: true
    });

    // Receive Stock Form
    const [stockReceipt, setStockReceipt] = useState({
        medicineId: '', supplierId: '', batchNumber: '', quantityReceived: 0, manufacturingDate: '', expiryDate: '', unitCostPrice: 0, unitSellingPrice: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [medsData, suppsData] = await Promise.all([
                PharmacyService.getAllMedicines(),
                PharmacyService.getAllSuppliers()
            ]);
            setMedicines(medsData);
            setSuppliers(suppsData);
        } catch (error) {
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PharmacyService.addMedicine(newMedicine);
            toast.success('Medicine added catalog');
            setIsAddMedicineModalOpen(false);
            setNewMedicine({ name: '', genericName: '', category: '', manufacturer: '', unit: '', minimumStockLevel: 10, requiresPrescription: true });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add medicine');
        }
    };

    const handleReceiveStock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PharmacyService.receiveStock(stockReceipt as any);
            toast.success('Stock received successfully');
            setIsReceiveStockModalOpen(false);
            setStockReceipt({ medicineId: '', supplierId: '', batchNumber: '', quantityReceived: 0, manufacturingDate: '', expiryDate: '', unitCostPrice: 0, unitSellingPrice: 0 });
            fetchData(); // Refresh to show new stock levels
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to receive stock');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage medicine catalog and receive new stock batches
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAddMedicineModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                        New Medicine
                    </button>
                    <button
                        onClick={() => setIsReceiveStockModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Store className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Receive Stock
                    </button>
                </div>
            </div>

            {/* Medicines List Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name (Generic)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock Available</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prescription</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">Loading inventory...</td></tr>
                        ) : medicines.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">No medicines in catalog</td></tr>
                        ) : (
                            medicines.map((medicine) => (
                                <tr key={medicine.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                        <div className="font-medium text-gray-900">{medicine.name}</div>
                                        <div className="text-xs text-gray-500">{medicine.genericName}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{medicine.category}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="flex items-center">
                                            <span className={`font-semibold ${medicine.currentStock <= medicine.minimumStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                                                {medicine.currentStock} {medicine.unit}s
                                            </span>
                                            {medicine.currentStock <= medicine.minimumStockLevel && (
                                                <AlertTriangle className="ml-1.5 h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {medicine.isActive ?
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Active</span> :
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactive</span>
                                        }
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {medicine.requiresPrescription ? 'Required' : 'OTC'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals Implementation Below (Simplified for brevity, would contain actual forms) */}
            {isAddMedicineModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAddMedicineModalOpen(false)} />

                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                            <div>
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Add Medicine to Catalog</h3>
                                <form onSubmit={handleAddMedicine} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                                            <input type="text" required value={newMedicine.name} onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                                            <input type="text" required value={newMedicine.genericName} onChange={e => setNewMedicine({ ...newMedicine, genericName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category (e.g., Antibiotic)</label>
                                            <input type="text" required value={newMedicine.category} onChange={e => setNewMedicine({ ...newMedicine, category: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                                            <input type="text" required value={newMedicine.manufacturer} onChange={e => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Unit (e.g., Tablet, Bottle)</label>
                                            <input type="text" required value={newMedicine.unit} onChange={e => setNewMedicine({ ...newMedicine, unit: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                                            <input type="number" required min="0" value={newMedicine.minimumStockLevel} onChange={e => setNewMedicine({ ...newMedicine, minimumStockLevel: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div className="sm:col-span-2 flex items-center h-full pt-4">
                                            <input id="req-presc" type="checkbox" checked={newMedicine.requiresPrescription} onChange={e => setNewMedicine({ ...newMedicine, requiresPrescription: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="req-presc" className="ml-2 block text-sm text-gray-900">Requires Doctor's Prescription</label>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2">Save Catalog Entry</button>
                                        <button type="button" onClick={() => setIsAddMedicineModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isReceiveStockModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsReceiveStockModalOpen(false)} />

                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                            <div>
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Receive Stock Batch</h3>
                                <form onSubmit={handleReceiveStock} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Select Medicine</label>
                                            <select required value={stockReceipt.medicineId} onChange={e => setStockReceipt({ ...stockReceipt, medicineId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                                                <option value="">-- Select Medicine --</option>
                                                {medicines.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} ({m.genericName})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Select Supplier</label>
                                            <select required value={stockReceipt.supplierId} onChange={e => setStockReceipt({ ...stockReceipt, supplierId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                                                <option value="">-- Select Supplier --</option>
                                                {suppliers.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                                            <input type="text" required value={stockReceipt.batchNumber} onChange={e => setStockReceipt({ ...stockReceipt, batchNumber: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quantity Received</label>
                                            <input type="number" required min="1" value={stockReceipt.quantityReceived || ''} onChange={e => setStockReceipt({ ...stockReceipt, quantityReceived: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufacturing Date (Optional)</label>
                                            <input type="date" value={stockReceipt.manufacturingDate} onChange={e => setStockReceipt({ ...stockReceipt, manufacturingDate: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                            <input type="date" required value={stockReceipt.expiryDate} onChange={e => setStockReceipt({ ...stockReceipt, expiryDate: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Unit Cost Price (₹)</label>
                                            <input type="number" required step="0.01" min="0" value={stockReceipt.unitCostPrice || ''} onChange={e => setStockReceipt({ ...stockReceipt, unitCostPrice: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Unit Selling Price (₹)</label>
                                            <input type="number" required step="0.01" min="0" value={stockReceipt.unitSellingPrice || ''} onChange={e => setStockReceipt({ ...stockReceipt, unitSellingPrice: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2">Receive Batch</button>
                                        <button type="button" onClick={() => setIsReceiveStockModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
