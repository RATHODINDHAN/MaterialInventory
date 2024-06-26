import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const FormDialog = ({ open, onClose, onAdd, onEdit, selectedComponent, existingComponents }) => {
    const [componentName, setComponentName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedComponent) {
            setComponentName(selectedComponent.component);
            setQuantity(selectedComponent.quantity);
            setPrice(selectedComponent.price);
            setNewPrice(selectedComponent.newprice || '');
            setPrice(selectedComponent.newprice || setPrice);
            setNewPrice('');
        } else {
            setComponentName('');
            setQuantity('');
            setPrice('');
            setNewPrice('');
        }
        setError('');
    }, [selectedComponent]);

    const handleAddOrEdit = () => {
        if (!componentName) {
            setError('Component name is required.');
            return;
        }

        const normalizedComponentName = componentName.toLowerCase();
        if (existingComponents.some(comp => comp && comp.component && comp.component.toLowerCase() === normalizedComponentName && comp !== selectedComponent)) {
            setError('A component with this name already exists.');
            return;
        }

        const component = {
            component: componentName,
            quantity: parseInt(quantity, 10),
            price: parseFloat(price),
            newprice: selectedComponent ? parseFloat(newPrice) : undefined,
        };

        if (selectedComponent) {
            onEdit(component);
        } else {
            onAdd(component);
        }
        onClose();


        setComponentName('');
        setQuantity('');
        setPrice('');
        setNewPrice('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{selectedComponent ? 'Edit Component' : 'Add Component'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Component Name"
                    fullWidth
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <TextField
                    margin="dense"
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Price (Rs)"
                    type="number"
                    fullWidth
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={!!selectedComponent}

                />
                {selectedComponent && (
                    <TextField
                        margin="dense"
                        label="New Price (Rs)"
                        type="number"
                        fullWidth
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleAddOrEdit} color="primary">
                    {selectedComponent ? 'Save Changes' : 'Add Component'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FormDialog;
