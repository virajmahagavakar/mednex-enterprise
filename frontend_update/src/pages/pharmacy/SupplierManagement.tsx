import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import type { SupplierDTO } from '../../services/api.types';
import toast from 'react-hot-toast';

const SupplierManagement: React.FC = () => {
    const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await PharmacyService.getAllSuppliers();
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PharmacyService.addSupplier({
                name, contactPerson, email, phone, address
            });
            toast.success('Supplier added successfully');
            setIsAddModalOpen(false);
            resetForm();
            fetchSuppliers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add supplier');
        }
    };

    const resetForm = () => {
        setName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage drug distributors and vendors
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Supplier
                </button>
            </div>

            {/* Supplier List Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact Person</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">Loading...</td></tr>
                        ) : suppliers.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">No suppliers found</td></tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {supplier.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{supplier.contactPerson}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{supplier.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{supplier.phone}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${supplier.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                                            }`}>
                                            {supplier.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Supplier Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAddModalOpen(false)} />

                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div>
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Add New Supplier</h3>
                                <form onSubmit={handleAddSupplier} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                                        <input type="text" id="contactPerson" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input type="text" id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea id="address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2">
                                            Save Supplier
                                        </button>
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                                            Cancel
                                        </button>
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

export default SupplierManagement;
