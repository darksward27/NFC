import React, { useState } from 'react';
import { FaFileUpload, FaDownload, FaCheck } from 'react-icons/fa';

const BulkAttendanceUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            // Preview first few rows
            const reader = new FileReader();
            reader.onload = (event) => {
                const csv = event.target.result;
                const lines = csv.split('\n').slice(0, 6); // Preview first 5 rows + header
                setPreview(lines.map(line => line.split(',')));
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:3000/api/attendance/bulk-upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            // Handle success
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'ID,Name,Date,Status,Time\n';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance-template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Bulk Attendance Upload</h2>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <FaDownload />
                    <span>Download Template</span>
                </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <FaFileUpload className="text-4xl text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">CSV files only</span>
                </label>
            </div>

            {preview.length > 0 && (
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-2">Preview</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                            {preview.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {error && (
                <div className="text-red-600 text-center">{error}</div>
            )}

            {file && (
                <div className="flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {uploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <FaCheck />
                        )}
                        <span>{uploading ? 'Uploading...' : 'Confirm Upload'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkAttendanceUpload; 