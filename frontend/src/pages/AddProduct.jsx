import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, clearSelectedProduct } from '../store/slices/productSlice';
import config from '../config/env';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct, loading, error } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    wholesaler: '',
    price: '',
    quantity: '',
    lowStockThreshold: config.BUSINESS.DEFAULT_LOW_STOCK_THRESHOLD.toString(),
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [marginPercentage, setMarginPercentage] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  // If editing, populate form with selected product data
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        wholesaler: selectedProduct.wholesaler || '',
        price: selectedProduct.price || '',
        quantity: selectedProduct.quantity || '',
        lowStockThreshold: selectedProduct.lowStockThreshold || config.BUSINESS.DEFAULT_LOW_STOCK_THRESHOLD.toString(),
        category: selectedProduct.category || '',
      });
    }
  }, [selectedProduct]);

  // Calculate selling price based on margin
  useEffect(() => {
    if (formData.price && marginPercentage) {
      const costPrice = parseFloat(formData.price);
      const margin = parseFloat(marginPercentage);
      const calculatedSellingPrice = costPrice + (costPrice * margin / 100);
      setSellingPrice(calculatedSellingPrice.toFixed(2));
    } else {
      setSellingPrice('');
    }
  }, [formData.price, marginPercentage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }

    if (!formData.wholesaler.trim()) {
      newErrors.wholesaler = 'Wholesaler name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid cost price is required';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = 'Valid alert quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    };

    try {
      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct._id, productData })).unwrap();
      } else {
        await dispatch(createProduct(productData)).unwrap();
      }

      // Clear form and navigate back
      dispatch(clearSelectedProduct());
      navigate('/products');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleCancel = () => {
    dispatch(clearSelectedProduct());
    navigate('/products');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {selectedProduct ? 'Update product information' : 'Add a new medicine to your inventory'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Medicine Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Medicine Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="Enter medicine name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Wholesaler Name */}
            <div>
              <label htmlFor="wholesaler" className="block text-sm font-medium text-gray-700">
                Wholesaler Name *
              </label>
              <input
                type="text"
                id="wholesaler"
                name="wholesaler"
                value={formData.wholesaler}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.wholesaler ? 'border-red-300' : ''
                }`}
                placeholder="Enter wholesaler name"
              />
              {errors.wholesaler && <p className="mt-1 text-sm text-red-600">{errors.wholesaler}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Antibiotics, Pain Relief"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Cost Price ({config.BUSINESS.CURRENCY_SYMBOL}) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.price ? 'border-red-300' : ''
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Margin Percentage */}
            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-gray-700">
                Margin % (Optional)
              </label>
              <input
                type="number"
                id="margin"
                step="0.01"
                min="0"
                value={marginPercentage}
                onChange={(e) => setMarginPercentage(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`e.g., ${config.BUSINESS.DEFAULT_MARGIN_PERCENTAGE}`}
              />
              <p className="mt-1 text-xs text-gray-500">Enter margin percentage to calculate selling price</p>
            </div>

            {/* Calculated Selling Price */}
            {sellingPrice && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Calculated Selling Price
                </label>
                <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {config.BUSINESS.CURRENCY_SYMBOL}{sellingPrice}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.quantity ? 'border-red-300' : ''
                }`}
                placeholder="0"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            {/* Alert Quantity */}
            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                Alert Quantity *
              </label>
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                min="0"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.lowStockThreshold ? 'border-red-300' : ''
                }`}
                placeholder="5"
              />
              {errors.lowStockThreshold && <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold}</p>}
              <p className="mt-1 text-xs text-gray-500">You'll be alerted when stock falls below this level</p>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Optional description or notes about the medicine"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : selectedProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
