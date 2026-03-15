import React, { useState, useEffect } from 'react';
import { PharmacyService } from '../../services/pharmacy.service';
import type { PharmacyPrescriptionDTO, DispenseRequest, DispenseItemRequest, InventoryBatchDTO } from '../../services/api.types';
import toast from 'react-hot-toast';

const DispensingStation: React.FC = () => {
    const [pendingPrescriptions, setPendingPrescriptions] = useState<PharmacyPrescriptionDTO[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<PharmacyPrescriptionDTO | null>(null);
    const [loading, setLoading] = useState(true);

    // Dispensing State for the selected prescription
    // Mapping format: { dispensedItemId: { batchId: quantityToDispense } }
    const [dispenseData, setDispenseData] = useState<Record<string, { batchId: string, quantity: number }>>({});

    // Batches cache per medicine
    const [availableBatches, setAvailableBatches] = useState<Record<string, InventoryBatchDTO[]>>({});

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await PharmacyService.getPendingPrescriptions();
            setPendingPrescriptions(data);
        } catch (error) {
            toast.error('Failed to load pending prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPrescription = async (prescription: PharmacyPrescriptionDTO) => {
        setSelectedPrescription(prescription);
        setDispenseData({}); // Reset dispenses

        // Fetch batches for all items in prescription
        const batchesMap: Record<string, InventoryBatchDTO[]> = {};
        try {
            for (const item of prescription.items) {
                if (!batchesMap[item.medicineId]) {
                    const batches = await PharmacyService.getActiveBatches(item.medicineId);
                    batchesMap[item.medicineId] = batches;
                }
            }
            setAvailableBatches(batchesMap);
        } catch (error) {
            toast.error("Failed to fetch available batches for medicines");
        }
    };

    const handleQuantityChange = (itemId: string, batchId: string, quantity: number) => {
        setDispenseData(prev => ({
            ...prev,
            [itemId]: { batchId, quantity }
        }));
    };

    const handleDispense = async () => {
        if (!selectedPrescription) return;

        // Construct request
        const itemsToDispense: DispenseItemRequest[] = [];

        for (const [itemId, data] of Object.entries(dispenseData)) {
            if (data.quantity > 0 && data.batchId) {
                itemsToDispense.push({
                    dispensedItemId: itemId,
                    inventoryBatchId: data.batchId,
                    quantityToDispense: data.quantity,
                    discountPercent: 0 // Optional feature
                });
            }
        }

        if (itemsToDispense.length === 0) {
            toast.error("Set at least one quantity to dispense");
            return;
        }

        const request: DispenseRequest = {
            items: itemsToDispense,
            paymentStatus: 'PAID' // Assuming immediate payment for now
        };

        try {
            await PharmacyService.fulfillPrescription(selectedPrescription.id, request);
            toast.success("Prescription fulfilled successfully");
            setSelectedPrescription(null);
            fetchPrescriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to dispense");
        }
    };


    return (
        <div className="space-y-6 animate-fade-in flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">

            {/* Left Column: Pending queue */}
            <div className="md:w-1/3 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-y-auto">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 sticky top-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Prescriptions</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{pendingPrescriptions.length} items waiting</p>
                </div>
                <ul className="divide-y divide-gray-200">
                    {loading ? (
                        <li className="p-4 text-center text-gray-500">Loading queue...</li>
                    ) : pendingPrescriptions.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">No pending prescriptions</li>
                    ) : (
                        pendingPrescriptions.map(p => (
                            <li
                                key={p.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPrescription?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                onClick={() => handleSelectPrescription(p)}
                            >
                                <div className="flex justify-between">
                                    <p className="font-medium text-gray-900">{p.patientName}</p>
                                    <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                                        {p.status}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-sm text-gray-500">
                                    <p>Dr. {p.doctorName}</p>
                                    <p>{new Date(p.prescriptionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Right Column: Dispensing Action Area */}
            <div className="md:w-2/3 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg flex flex-col">
                {selectedPrescription ? (
                    <>
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Fulfill Prescription</h3>
                            <div className="mt-1 text-sm text-gray-500 flex justify-between">
                                <span>Patient: <strong>{selectedPrescription.patientName}</strong></span>
                                <span>Doctor: <strong>{selectedPrescription.doctorName}</strong></span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Medicine</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rx Qty</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dispensed</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Select Batch</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dispense Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {selectedPrescription.items.map((item) => {
                                        const batches = availableBatches[item.medicineId] || [];
                                        const pendingQty = item.prescribedQuantity - item.dispensedQuantity;

                                        return (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                    {item.medicineName}
                                                    <div className="font-normal text-xs text-gray-500">{item.dosageInstructions}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.prescribedQuantity}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.dispensedQuantity}</td>

                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {pendingQty > 0 ? (
                                                        <select
                                                            className="mt-1 block w-full rounded-md border-gray-300 py-1 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
                                                            value={dispenseData[item.id]?.batchId || ''}
                                                            onChange={(e) => handleQuantityChange(item.id, e.target.value, dispenseData[item.id]?.quantity || 0)}
                                                        >
                                                            <option value="">-- Select Batch --</option>
                                                            {batches.map(b => (
                                                                <option key={b.id} value={b.id} disabled={b.quantityAvailable === 0}>
                                                                    {b.batchNumber} (Stock: {b.quantityAvailable}) - Exp: {b.expiryDate}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : <span className="text-green-600 font-medium text-xs rounded-full bg-green-50 px-2 py-1">Fulfilled</span>}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {pendingQty > 0 ? (
                                                        <input
                                                            type="number"
                                                            max={pendingQty}
                                                            min={0}
                                                            className="mt-1 block w-20 rounded-md border-gray-300 py-1 px-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                                            value={dispenseData[item.id]?.quantity || ''}
                                                            onChange={(e) => handleQuantityChange(item.id, dispenseData[item.id]?.batchId || '', parseInt(e.target.value) || 0)}
                                                        />
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50 flex flex-row-reverse">
                            <button
                                onClick={handleDispense}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Process Dispense
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No prescription selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Select a pending prescription from the queue to start dispensing.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DispensingStation;
