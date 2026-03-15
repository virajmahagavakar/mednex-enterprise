import React, { useState, useEffect } from 'react';
import { DiagnosticService } from '../../services/diagnostics.service';
import type { DiagnosticOrderLineItemDTO, DiagnosticResultUploadRequest } from '../../services/api.types';
import { Activity, CheckCircle, Clock, Search, Beaker, FileText, Upload } from 'lucide-react';

export const LabDashboard = () => {
    const [activeTab, setActiveTab] = useState<'WORKLIST' | 'COMPLETED'>('WORKLIST');
    const [worklist, setWorklist] = useState<DiagnosticOrderLineItemDTO[]>([]);
    const [selectedItem, setSelectedItem] = useState<DiagnosticOrderLineItemDTO | null>(null);
    const [resultValue, setResultValue] = useState('');
    const [interpretationFlag, setInterpretationFlag] = useState('NORMAL');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchWorklist();
    }, [activeTab]);

    const fetchWorklist = async () => {
        try {
            // Fetch PATHOLOGY worklist
            const response = await DiagnosticService.getWorklist('PATHOLOGY');
            if (activeTab === 'WORKLIST') {
                setWorklist(response.filter(item => item.status === 'PENDING'));
            } else {
                setWorklist(response.filter(item => item.status === 'COMPLETED'));
            }
        } catch (error) {
            console.error("Error fetching lab worklist", error);
        }
    };

    const handleUploadResult = async () => {
        if (!selectedItem) return;

        const request: DiagnosticResultUploadRequest = {
            resultValue,
            interpretationFlag,
            remarks
        };

        try {
            await DiagnosticService.uploadResult(selectedItem.id, request);
            alert('Result uploaded successfully!');
            setSelectedItem(null);
            setResultValue('');
            setRemarks('');
            fetchWorklist();
        } catch (error) {
            console.error("Failed to upload result", error);
            alert("Failed to upload result.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b-4 border-indigo-500 pb-2 inline-block">
                        Laboratory Information System (LIS)
                    </h1>
                    <p className="text-gray-500 mt-2">Manage pathology sample processing and results.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-3 border border-indigo-100">
                        <div className="bg-indigo-100 p-2 rounded-md"><Beaker className="h-5 w-5 text-indigo-600" /></div>
                        <div>
                            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Pending Samples</p>
                            <p className="text-xl font-bold text-indigo-700">{worklist.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex h-[600px]">
                {/* Left Queue Panel */}
                <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setActiveTab('WORKLIST')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'WORKLIST' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pending Queue
                            </button>
                            <button
                                onClick={() => setActiveTab('COMPLETED')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Completed
                            </button>
                        </div>
                        <div className="mt-4 relative">
                            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Accession ID or Patient..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {worklist.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900">{item.catalogItem.name}</span>
                                    {item.status === 'PENDING' ? (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Done
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">ID: {item.id.substring(0, 8).toUpperCase()}</span>
                                    <span>Notes: {item.notes || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                        {worklist.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No samples found in queue.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Panel */}
                <div className="flex-1 bg-white p-6 overflow-y-auto">
                    {selectedItem ? (
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="border-b pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.catalogItem.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">Accession ID: {selectedItem.id}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Test Details</p>
                                    <p className="font-medium text-gray-900">{selectedItem.catalogItem.description || 'Standard Test'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Reference Range</p>
                                    <p className="font-medium font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                        {selectedItem.catalogItem.defaultReferenceRange}
                                    </p>
                                </div>
                            </div>

                            {selectedItem.status === 'PENDING' ? (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4" /> Input Results</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Observed Value</label>
                                        <input
                                            type="text"
                                            value={resultValue}
                                            onChange={e => setResultValue(e.target.value)}
                                            className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter measured value (e.g., 14.2 g/dL)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation Flag</label>
                                        <select
                                            value={interpretationFlag}
                                            onChange={e => setInterpretationFlag(e.target.value)}
                                            className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High (H)</option>
                                            <option value="LOW">Low (L)</option>
                                            <option value="CRITICAL">Critical (C)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Technician Remarks</label>
                                        <textarea
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={3}
                                            className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            placeholder="Any observational notes regarding the sample quality or testing conditions..."
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <button
                                            onClick={handleUploadResult}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                            disabled={!resultValue}
                                        >
                                            <Upload className="w-4 h-4" /> Sign Off & Submit Result
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-2">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                    <h3 className="text-lg font-bold text-green-800">Result Finalized</h3>
                                    <p className="text-green-700">This test has been processed and reported to the patient's EMR.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <Beaker className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-xl font-medium text-gray-500 mb-2">No Sample Selected</p>
                            <p className="text-sm">Select a pending test from the worklist queue to accession and input results.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
