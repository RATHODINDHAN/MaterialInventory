import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem,
    Select, FormControl, InputLabel, Typography, IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import './Home.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Home = ({ cameraQuantity }) => {
    const [data, setData] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState({
        Product: '',
        Component: '',
        Quantity: '',
        ImageURL: '',
        Description: '',
        Price: '',
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedData = localStorage.getItem('uploadedData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewComponent({
            Product: '',
            Component: '',
            Quantity: '',
            ImageURL: '',
            Description: '',
            Price: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewComponent((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!newComponent.Product) {
            alert('Enter Product name')
            return;
        } else if (!newComponent.ImageURL) {
            alert('Enter a Imageurl')
            return;
        }

        const updatedData = [...data];
        const productIndex = updatedData.findIndex((item) => item.Product === newComponent.Product);

        if (productIndex !== -1) {
            const componentIndex = updatedData[productIndex].Components.findIndex(
                (component) => component.name === newComponent.Component
            );

            if (componentIndex !== -1) {
                updatedData[productIndex].Components[componentIndex] = {
                    ...updatedData[productIndex].Components[componentIndex],
                    quantity: newComponent.Quantity ? parseInt(newComponent.Quantity) : updatedData[productIndex].Components[componentIndex].quantity,
                    price: newComponent.Price ? parseFloat(newComponent.Price) : updatedData[productIndex].Components[componentIndex].price,
                    description: newComponent.Description ? newComponent.Description : updatedData[productIndex].Components[componentIndex].description,
                    imageUrl: newComponent.ImageURL ? newComponent.ImageURL : updatedData[productIndex].Components[componentIndex].imageUrl,
                };
            } else {
                updatedData[productIndex].Components.push({
                    component: newComponent.Component,
                    quantity: parseInt(newComponent.Quantity),
                    price: parseFloat(newComponent.Price),
                    description: newComponent.Description,
                    imageUrl: newComponent.ImageURL,
                });
            }
        } else {
            updatedData.push({
                Product: newComponent.Product,
                Components: [{
                    component: newComponent.Component,
                    quantity: parseInt(newComponent.Quantity),
                    price: parseFloat(newComponent.Price),
                    description: newComponent.Description,
                    imageUrl: newComponent.ImageURL,
                }]
            });
        }

        setData(updatedData);
        localStorage.setItem('uploadedData', JSON.stringify(updatedData));
        handleCloseDialog();
    };

    const handleProductClick = (product) => {
        const productData = localStorage.getItem(`productData_${product.Product}`);
        const cameraQuantity = productData ? JSON.parse(productData).cameraQuantity : 0;
        navigate('/dashboard', { state: { product, cameraQuantity } });
    };

    const handleOpenDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedProduct('');
        setSearchTerm('');
    };

    const handleDeleteProductChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedProduct(e.target.value);
    };

    const handleDeleteProduct = () => {

        const updatedData = data.filter(item => item.Product !== selectedProduct);
        setData(updatedData);
        localStorage.setItem('uploadedData', JSON.stringify(updatedData));
        handleCloseDeleteDialog();
        localStorage.removeItem('lastViewedProduct')
    };

    const filteredData = data.filter(item => item.Components && item.Components.length > 0);
    const searchedData = filteredData.filter(item => item.Product.toLowerCase().includes(searchTerm.toLowerCase()));

    if (location.pathname === '/dashboard') {
        return null; // Don't render anything if in dashboard
    }

    const excelDataDownload = () => {
        if (data.length === 0) {
            alert("No Excel data available.");
            return;
        }

        const workbook = XLSX.utils.book_new();
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '-');
        const formattedTime = now.toLocaleTimeString('en-GB').replace(/:/g, '-');

        data.forEach((item) => {
            const storedProductData = localStorage.getItem(`productData_${item.Product}`);
            const components = storedProductData ? JSON.parse(storedProductData).components : item.Components;

            if (!components || components.length === 0) {
                console.warn(`No components found for product: ${item.Product}`);
                return;
            }

            // Normalize property names to handle case insensitivity
            const normalize = (obj) => {
                const normalized = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        normalized[key.toLowerCase()] = obj[key];
                    }
                }
                return normalized;
            };

            // Collect all unique keys from all components
            const allKeys = new Set();
            components.forEach(component => {
                Object.keys(normalize(component)).forEach(key => allKeys.add(key));
            });

            // Convert Set to Array and map to headers with proper capitalization
            const headers = Array.from(allKeys).map(key => key.charAt(0).toUpperCase() + key.slice(1));

            // Map and normalize components to include all headers
            const modifiedComponents = components.map((component) => {
                const normalizedComponent = normalize(component);
                const completeComponent = {};
                headers.forEach(header => {
                    const lowerHeader = header.toLowerCase();
                    completeComponent[header] = normalizedComponent[lowerHeader] || "";
                });
                return completeComponent;
            });

            // Create worksheet from modified components
            const worksheet = XLSX.utils.json_to_sheet(modifiedComponents, { header: headers });

            const productName = item.Product.replace(/[\\/:*?"<>|]/g, '');
            const sheetName = `${productName}`;
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data1 = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data1, `Capgemini_Inventory_${formattedDate}_${formattedTime}_.xlsx`);
    };

    const downloadProductExcel = (product) => {
        const storedProductData = localStorage.getItem(`productData_${product.Product}`);
        const components = storedProductData ? JSON.parse(storedProductData).components : product.Components;

        if (!components || components.length === 0) {
            console.warn(`No components found for product: ${product.Product}`);
            return;
        }

        const workbook = XLSX.utils.book_new();
        const productName = product.Product.replace(/[\\/:*?"<>|]/g, ''); // Remove invalid characters from the product name

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // Format date as DD-MM-YYYY
        const formattedTime = now.toLocaleTimeString('en-GB').replace(/:/g, '-'); // Format time as HH-MM-SS

        // Normalize property names to handle case insensitivity
        const normalize = (obj) => {
            const normalized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    normalized[key.toLowerCase()] = obj[key];
                }
            }
            return normalized;
        };

        // Collect all unique keys from all components
        const allKeys = new Set();
        components.forEach(component => {
            Object.keys(normalize(component)).forEach(key => allKeys.add(key));
        });

        // Convert Set to Array and map to headers with proper capitalization
        const headers = Array.from(allKeys).map(key => key.charAt(0).toUpperCase() + key.slice(1));

        // Map and normalize components to include all headers
        const modifiedComponents = components.map((component) => {
            const normalizedComponent = normalize(component);
            const completeComponent = {};
            headers.forEach(header => {
                const lowerHeader = header.toLowerCase();
                completeComponent[header] = normalizedComponent[lowerHeader] || "";
            });
            return completeComponent;
        });

        // Create worksheet from modified components
        const worksheet = XLSX.utils.json_to_sheet(modifiedComponents, { header: headers });

        // Combine product name, date, and time for the sheet name
        const sheetName = `${productName}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(data, `${productName}_${formattedDate}_${formattedTime}_data.xlsx`);
    };

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    return (

        <div className="home-container">

            <Typography variant="h4">Welcome to Camera World <div className="top-right-button">
                <Button onClick={excelDataDownload} variant="contained" color="primary">
                    Download All Products data
                </Button>
            </div></Typography>
            <TextField
                label="Search Products"
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="cards-container">
                {searchedData.length > 0 ? (
                    searchedData.map((item, index) => {
                        const productData = localStorage.getItem(`productData_${item.Product}`);
                        const cameraQuantity = productData ? JSON.parse(productData).cameraQuantity : 0;

                        return (
                            <div key={index} className="card">
                                <div className='card-header'>
                                    <IconButton onClick={() => downloadProductExcel(item)} color="primary">
                                        <DownloadIcon />
                                    </IconButton>
                                </div>
                                <Typography variant="h5">{capitalizeFirstLetter(item.Product)}</Typography>
                                <img src={item.Components[0].imageUrl} alt={item.Product} className="product-image" />
                                <Typography>Total Camera Built: {cameraQuantity}</Typography>
                                <Button onClick={() => handleProductClick(item)} variant="contained" color="primary" style={{ marginTop: '10px' }}>
                                    View Details
                                </Button>
                            </div>
                        );
                    })
                ) : (
                    <Typography variant="h6">There is no products</Typography>
                )}
            </div>
            <Box mt={2} className="button-group">
                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                    Add Product
                </Button>
                <Button variant="contained" color="error" onClick={handleOpenDeleteDialog}>
                    Delete Product
                </Button>
            </Box>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle className="dialog-title">Add New Component</DialogTitle>
                <DialogContent className="dialog-content">
                    <TextField
                        label="Product"
                        name="Product"
                        value={newComponent.Product}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Component"
                        name="Component"
                        value={newComponent.Component}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Quantity"
                        name="Quantity"
                        value={newComponent.Quantity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Image URL"
                        name="ImageURL"
                        value={newComponent.ImageURL}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        name="Description"
                        value={newComponent.Description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Price"
                        name="Price"
                        value={newComponent.Price}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">Add</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle className="dialog-title">Delete Product</DialogTitle>
                <DialogContent className="dialog-content">
                    <TextField
                        label="Search Product"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={handleDeleteProductChange}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Product</InputLabel>
                        <Select
                            value={selectedProduct}
                            onChange={handleDeleteProductChange}
                        >
                            {searchedData.map((product, index) => (
                                <MenuItem key={index} value={product.Product}>
                                    {product.Product}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button onClick={handleCloseDeleteDialog} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteProduct} color="primary">Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Home;
