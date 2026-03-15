import React, { useState, useEffect } from 'react';
import { DiagnosticService } from '../../services/diagnostics.service';
import type { DiagnosticOrderLineItemDTO, DiagnosticResultUploadRequest } from '../../services/api.types';
import { Activity, CheckCircle, Clock, Search, Image as ImageIcon, Eye, Upload } from 'lucide-react';

export const RadiologyDashboard = () => {
    const [activeTab, setActiveTab] = useState<'WORKLIST' | 'COMPLETED'>('WORKLIST');
    const [worklist, setWorklist] = useState<DiagnosticOrderLineItemDTO[]>([]);
    const [selectedItem, setSelectedItem] = useState<DiagnosticOrderLineItemDTO | null>(null);
    const [remarks, setRemarks] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [interpretationFlag, setInterpretationFlag] = useState('NORMAL');

    useEffect(() => {
        fetchWorklist();
    }, [activeTab]);

    const fetchWorklist = async () => {
        try {
            const response = await DiagnosticService.getWorklist('RADIOLOGY');
            if (activeTab === 'WORKLIST') {
                setWorklist(response.filter(item => item.status === 'PENDING'));
            } else {
                setWorklist(response.filter(item => item.status === 'COMPLETED'));
            }
        } catch (error) {
            console.error("Error fetching radiology worklist", error);
        }
    };

    const handleUploadResult = async () => {
        if (!selectedItem) return;

        // Generate synthetic DICOM UIDs for simulation purposes
        const dicomStudyUid = `1.2.840.113619.2.${Math.floor(Math.random() * 1000000)}`;
        const dicomSeriesUid = `1.3.12.2.1107.5.1.4.${Math.floor(Math.random() * 1000000)}`;

        const request: DiagnosticResultUploadRequest = {
            resultValue: "See Attached PDF/DICOM Report.",
            interpretationFlag,
            remarks,
            documentUrl: documentUrl || "/reports/dummy-scan-report.pdf",
            dicomStudyUid,
            dicomSeriesUid
        };

        try {
            await DiagnosticService.uploadResult(selectedItem.id, request);
            alert('Radiology Report and Metadata uploaded successfully!');
            setSelectedItem(null);
            setRemarks('');
            setDocumentUrl('');
            fetchWorklist();
        } catch (error) {
            console.error("Failed to upload report", error);
            alert("Failed to upload report.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b-4 border-cyan-500 pb-2 inline-block">
                        Radiology Information System (RIS)
                    </h1>
                    <p className="text-gray-500 mt-2">Manage imaging orders, view scans, and finalize structural reports.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-cyan-50 rounded-lg p-3 flex items-center gap-3 border border-cyan-100">
                        <div className="bg-cyan-100 p-2 rounded-md"><ImageIcon className="h-5 w-5 text-cyan-600" /></div>
                        <div>
                            <p className="text-xs text-cyan-500 font-semibold uppercase tracking-wider">Pending Scans</p>
                            <p className="text-xl font-bold text-cyan-700">{worklist.length}</p>
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
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'WORKLIST' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Modality Worklist
                            </button>
                            <button
                                onClick={() => setActiveTab('COMPLETED')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Reported
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {worklist.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-gray-200 bg-white hover:border-cyan-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900">{item.catalogItem.name}</span>
                                    {item.status === 'PENDING' ? (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Awaiting Read
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Signed
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p className="mb-1"><span className="font-medium">Order Notes:</span> {item.notes || 'None'}</p>
                                </div>
                            </div>
                        ))}
                        {worklist.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No imaging studies pending review.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Panel */}
                <div className="flex-1 bg-slate-900 p-0 overflow-y-auto flex flex-col relative">
                    {selectedItem ? (
                        <>
                            {/* Simulated DICOM Viewer Header */}
                            <div className="bg-black text-gray-400 text-xs p-2 flex justify-between border-b border-gray-800">
                                <span className="flex items-center gap-2"><Eye className="w-3 h-3" /> WebPACS Viewer v2.1.4</span>
                                <span>Modality: {selectedItem.catalogItem.name.includes("MRI") ? "MR" : selectedItem.catalogItem.name.includes("CT") ? "CT" : "DX"} | W: 400 L: 40</span>
                            </div>

                            {/* Simulated Image Area */}
                            <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black relative">
                                <div className="absolute top-4 left-4 text-emerald-500 text-xs font-mono opacity-60">
                                    Patient ID: {selectedItem.id.substring(0, 6)}<br />
                                    DOB: 1980/01/01<br />
                                    Sex: M
                                </div>
                                <div className="absolute top-4 right-4 text-emerald-500 text-xs font-mono opacity-60 text-right">
                                    Study Date: 2026/03/06<br />
                                    {selectedItem.catalogItem.name}
                                </div>
                                <ImageIcon className="w-32 h-32 text-gray-700 opacity-20" />
                                <div className="absolute inset-0 border border-emerald-900/30 m-4 pointer-events-none rounded" />
                            </div>

                            {/* Reporting Panel overlaying the bottom */}
                            {selectedItem.status === 'PENDING' ? (
                                <div className="bg-white border-t border-gray-300 p-6 absolute bottom-0 left-0 right-0 max-h-[50%] overflow-y-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
                                    <h3 className="font-bold text-gray-900 mb-4">Radiologist Report Transcription</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Finding Classification</label>
                                            <select
                                                value={interpretationFlag}
                                                onChange={e => setInterpretationFlag(e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                                            >
                                                <option value="NORMAL">Normal / Unremarkable</option>
                                                <option value="ABNORMAL_BENIGN">Abnormal, Benign</option>
                                                <option value="ABNORMAL_MALIGNANT">Abnormal, Suspected Malignancy</option>
                                                <option value="CRITICAL">Critical Finding (requires immediate notification)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Attach Final Document (URL)</label>
                                            <input
                                                type="text"
                                                value={documentUrl}
                                                onChange={e => setDocumentUrl(e.target.value)}
                                                placeholder="/reports/scan.pdf"
                                                className="w-full text-sm border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Findings & Impressions (Narrative)</label>
                                        <textarea
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={4}
                                            className="w-full text-sm border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500 font-serif"
                                            placeholder="Write detailed findings here..."
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleUploadResult}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                            disabled={!remarks}
                                        >
                                            <Upload className="w-4 h-4" /> Sign and Finalize Report
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-900 border-t border-gray-800 p-4 absolute bottom-0 left-0 right-0 flex items-center justify-center">
                                    <div className="text-emerald-500 flex items-center gap-2 font-mono text-sm">
                                        <CheckCircle className="w-4 h-4" /> Report Finalized and Signed.
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-black">
                            <ImageIcon className="w-16 h-16 opacity-20 mb-4 text-gray-400" />
                            <p className="font-mono text-sm">PACS Viewer standby. Select a study.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
