import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Button, Typography, TextField, Stack, Checkbox, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import Home from '../Home/Home';
import FormDialog from '../Elements/formDialog';
import './Dashboard.css';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(() => {
        const lastViewedProduct = localStorage.getItem('lastViewedProduct');
        return location.state?.product || (lastViewedProduct && JSON.parse(lastViewedProduct));
    });
    const [data, setData] = useState([]);
    const [cameraQuantity, setCameraQuantity] = useState(0);
    const [quantityInput, setQuantityInput] = useState(0);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        if (product && product.Product) {
            const storedProductData = localStorage.getItem(`productData_${product.Product}`);
            if (storedProductData) {
                const parsedData = JSON.parse(storedProductData);
                const validData = parsedData.components.filter(component => component.component && component.quantity !== null && component.price !== null);
                setData(validData.map(component => ({
                    ...component,
                    imageUrl: component.imageUrl || parsedData.imageUrl
                })));
                setCameraQuantity(parsedData.cameraQuantity);
                setImageUrl(parsedData.imageUrl);
            } else {
                const defaultImageUrl = product.Components[0]?.imageUrl || '';
                const validComponents = product.Components.filter(component => component.component && component.quantity !== null && component.price !== null);
                setData(validComponents.map(component => ({
                    ...component,
                    imageUrl: component.imageUrl || defaultImageUrl
                })));
                setCameraQuantity(0);
                setImageUrl(defaultImageUrl);
            }
            localStorage.setItem('lastViewedProduct', JSON.stringify(product));
        }
    }, [product]);

    const updateLocalStorage = (updatedComponents, updatedCameraQuantity) => {
        const productData = {
            components: updatedComponents,
            cameraQuantity: updatedCameraQuantity,
            imageUrl: imageUrl,
        };
        localStorage.setItem(`productData_${product.Product}`, JSON.stringify(productData));
    };

    const handleIncrease = () => {
        const increaseAmount = quantityInput > 0 ? quantityInput : 1;
        let flag = false;
        const updatedData = data.map((item) => {
            if (item.quantity >= increaseAmount) {
                return { ...item, quantity: item.quantity - increaseAmount };
            } else {
                flag = true;
                return item;
            }
        });
        if (flag) {
            alert('Sorry, Not Enough Components to Build New Camera');
        } else {
            const newCameraQuantity = cameraQuantity + increaseAmount;
            setCameraQuantity(newCameraQuantity);
            setData(updatedData);
            updateLocalStorage(updatedData, newCameraQuantity);
        }
        setQuantityInput(0);
    };

    const handleDecrease = () => {
        const decreaseAmount = quantityInput > 0 ? quantityInput : 1;
        if (cameraQuantity >= decreaseAmount) {
            const updatedData = data.map((item) => {
                return { ...item, quantity: item.quantity + decreaseAmount };
            });
            const newCameraQuantity = cameraQuantity - decreaseAmount;
            setCameraQuantity(newCameraQuantity);
            setData(updatedData);
            updateLocalStorage(updatedData, newCameraQuantity);
        } else {
            alert('Invalid Camera Entry');
        }
        setQuantityInput(0);
    };

    const handleInputChange = (e) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue)) {
            setQuantityInput(newValue);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleIncrease(quantityInput);
        }
    };

    const handleAddComponent = (component) => {
        if (!component.component || component.quantity === null || component.price === null) {
            alert('Component name, quantity, and price are required');
            return;
        }
        const updatedData = [...data, { ...component, imageUrl }];
        setData(updatedData);
        updateLocalStorage(updatedData, cameraQuantity);
        handleCloseFormDialog()
    };

    const handleEditComponent = (component) => {
        if (!component.component || component.quantity === null || component.price === null) {
            alert('Component name, quantity, and price are required');
            return;
        }
        const updatedData = data.map((item, index) =>
            index === selectedIndex ? { ...component, imageUrl: item.imageUrl || imageUrl } : item
        );
        setData(updatedData);
        updateLocalStorage(updatedData, cameraQuantity);
        setSelectedComponent(null);
        setSelectedIndex(null);
    };

    const handleDeleteComponent = (index) => {
        const updatedData = data.filter((_, i) => i !== index);
        setData(updatedData);
        if (updatedData.length > 0) {
            setImageUrl(updatedData[0].imageUrl || imageUrl);
        } else {
            setImageUrl('');
        }
        updateLocalStorage(updatedData, cameraQuantity);
        setSelectedComponent(null);
        setSelectedIndex(null);
    };

    const handleOpenFormDialog = (component = null, index = null) => {
        setSelectedComponent(component);
        setSelectedIndex(index);
        setFormDialogOpen(true);

    };

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
        setSelectedComponent(null);
        setSelectedIndex(null)

    };

    const handleCheckboxChange = (actualIndex) => {
        if (selectedIndex === actualIndex) {
            setSelectedComponent(null);
            setSelectedIndex(null);
        } else {
            setSelectedComponent(data[actualIndex]);
            setSelectedIndex(actualIndex);
        }
    };

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredData = data ? data.filter((component) =>
        component.component && component.component.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const columns = [
        {
            field: 'checkbox',
            headerName: '',
            width: 50,
            renderCell: (params) => (
                <Checkbox
                    checked={selectedIndex === params.row.index}
                    onChange={() => handleCheckboxChange(params.row.index)}
                />
            ),
        },
        { field: 'component', headerName: 'Component', width: 200 },
        { field: 'quantity', headerName: 'Quantity', width: 150 },
        {
            field: 'price',
            headerName: 'Price (Rs)',
            width: 150,
            renderCell: (params) => (
                params.row.newprice !== undefined && params.row.newprice !== null && !isNaN(params.row.newprice) ? (
                    <span>
                        {params.row.newprice.toFixed(2)} (
                        <span className={params.row.newprice > params.row.price ? 'price-up' : 'price-down'}>
                            {params.row.price !== null && !isNaN(params.row.price) ? (params.row.newprice > params.row.price ? '▲' : '▼') + (Math.abs(params.row.newprice - params.row.price)).toFixed(2) : 'N/A'}
                        </span>
                        )
                    </span>
                ) : (
                    params.row.price !== null && !isNaN(params.row.price) ? params.row.price.toFixed(2) : 'N/A'
                )
            ),
        },
        {
            field: 'delete',
            headerName: 'Delete Component',
            width: 150,
            renderCell: (params) => (
                <IconButton
                    aria-label="delete"
                    onClick={() => handleDeleteComponent(params.row.index)}
                >
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

    const rows = filteredData.map((row, index) => ({
        ...row,
        id: index,
        index: data.indexOf(row), // Map the filtered data index to the original data index
    }));

    if (!product) {
        return <Typography variant="h4">No product selected</Typography>;
    }

    return (
        <Box p={2} className="dashboard-container">
            {data.length > 0 ? (
                <>
                    <Typography variant="h4" gutterBottom>
                        {product.Product} Details
                    </Typography>
                    <img src={imageUrl} alt={product.Product} width="100" /><br />
                    <Typography variant="h6" gutterBottom>
                        Select Number of {product.Product} Model Built:
                        <Button onClick={handleDecrease}>-</Button>
                        <input
                            type="text"
                            value={quantityInput !== 0 ? quantityInput : cameraQuantity}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            style={{ width: '50px', textAlign: 'center' }}
                        />
                        <Button onClick={handleIncrease}>+</Button>&nbsp;&nbsp;
                        {`Total Camera Built: ${cameraQuantity} `}
                    </Typography>
                </>
            ) : (
                <Typography variant="h4" gutterBottom>
                    selected Product does not have components
                </Typography>
            )}
            <Home cameraQuantity={cameraQuantity} />
            <Box display="flex" justifyContent="flex-end" mt={2} className="dashboard-table-search-container">
                <TextField
                    label="Search Component"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                />
            </Box>
            <Box display="flex" justifyContent="center" mt={4} className="dashboard-table-container">
                {data.length > 0 && (
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={pageSize}
                            rowsPerPageOptions={[25, 50, 100]}
                            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                            checkboxSelection={false}

                        />
                    </div>
                )}
            </Box>
            <Box mt={2} display="flex" justifyContent="space-between" maxWidth="70%" mx="auto">
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="primary" onClick={() => handleOpenFormDialog()}>
                        Add Component
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenFormDialog(selectedComponent, selectedIndex)}
                        disabled={selectedComponent === null}
                    >
                        Edit Component
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </Stack>
            </Box>
            <FormDialog
                open={formDialogOpen}
                onClose={handleCloseFormDialog}
                onAdd={handleAddComponent}
                onEdit={handleEditComponent}
                selectedComponent={selectedComponent}
                existingComponents={data}
            />
        </Box>
    );
};

export default Dashboard;
