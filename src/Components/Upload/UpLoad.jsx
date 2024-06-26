import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const UpLoad = ({ setData }) => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Clear all product-related data from localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('productData_') || key.startsWith('lastViewed_') || key === 'lastViewedProduct') {
                    localStorage.removeItem(key);
                }
            });

            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const consolidatedData = [];

            workbook.SheetNames.forEach((sheetName) => {
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                const product = sheetName; // Use sheet name as product name

                const components = sheetData.map((row) => {
                    // Normalize keys to lowercase for case-insensitive matching
                    const normalizedRow = Object.keys(row).reduce((acc, key) => {
                        acc[key.toLowerCase()] = row[key];
                        return acc;
                    }, {});

                    return {
                        component: normalizedRow.component || '',
                        quantity: normalizedRow.quantity || 0,
                        imageUrl: normalizedRow.imageurl || '',
                        description: normalizedRow.description || '',
                        price: normalizedRow.newprice ? Number(normalizedRow.newprice) : Number(normalizedRow.price || 0),
                    };
                });

                consolidatedData.push({
                    Product: product,
                    Components: components,
                });
            });

            setData(consolidatedData);
            localStorage.setItem('uploadedData', JSON.stringify(consolidatedData));
            navigate('/');
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <h2>Upload Excel File</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file}>Upload</button>
        </div>
    );
};

export default UpLoad;

