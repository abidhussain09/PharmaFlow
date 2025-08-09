import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { createSale, generateReceipt } from '../store/slices/salesSlice';
import config from '../config/env';

const NewSale = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.products);
  const { loading, error, currentSale } = useSelector((state) => state.sales);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
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

  const addProductToSale = (product) => {
    const existingProduct = selectedProducts.find(p => p.product._id === product._id);

    if (existingProduct) {
      // Increase quantity if product already exists
      setSelectedProducts(prev => prev.map(p =>
        p.product._id === product._id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      // Add new product
      setSelectedProducts(prev => [...prev, {
        product: product,
        quantity: 1,
        price: product.price * (1 + config.BUSINESS.DEFAULT_MARGIN_PERCENTAGE / 100) // Default markup, can be edited
      }]);
    }

    setProductSearch('');
    setShowProductList(false);
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromSale(productId);
      return;
    }

    setSelectedProducts(prev => prev.map(p =>
      p.product._id === productId
        ? { ...p, quantity: parseInt(quantity) }
        : p
    ));
  };

  const updateProductPrice = (productId, price) => {
    setSelectedProducts(prev => prev.map(p =>
      p.product._id === productId
        ? { ...p, price: parseFloat(price) || 0 }
        : p
    ));
  };

  const removeProductFromSale = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product._id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (selectedProducts.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }

    // Check if any selected product has insufficient stock
    const stockErrors = [];
    selectedProducts.forEach(item => {
      if (item.quantity > item.product.quantity) {
        stockErrors.push(`${item.product.name} - Only ${item.product.quantity} available`);
      }
    });

    if (stockErrors.length > 0) {
      newErrors.stock = stockErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const saleData = {
      customerInfo,
      products: selectedProducts.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const result = await dispatch(createSale(saleData)).unwrap();

      // Ask if user wants to download receipt
      if (window.confirm('Sale recorded successfully! Would you like to download the receipt?')) {
        dispatch(generateReceipt(result.sale._id));
      }

      // Reset form
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
      setSelectedProducts([]);

      // Optionally navigate to sales list or stay on page
      // navigate('/sales');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: config.BUSINESS.CURRENCY,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Generate Sales Receipt
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a new sale and generate receipt
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Customer address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Select Products
            </h3>

            {/* Product Search */}
            <div className="relative mb-4">
              <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                id="productSearch"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductList(e.target.value.length > 0);
                }}
                onFocus={() => setShowProductList(productSearch.length > 0)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Type to search medicines..."
              />

              {/* Product Dropdown */}
              {showProductList && filteredProducts.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredProducts.slice(0, 10).map((product) => (
                    <div
                      key={product._id}
                      onClick={() => addProductToSale(product)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          {product.category && (
                            <span className="ml-2 text-gray-500">({product.category})</span>
                          )}
                        </div>
                        <div className="text-sm">
                          Stock: {product.quantity} | {formatCurrency(product.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.products && <p className="mb-4 text-sm text-red-600">{errors.products}</p>}
            {errors.stock && <p className="mb-4 text-sm text-red-600">{errors.stock}</p>}

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Selected Products</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProducts.map((item) => (
                        <tr key={item.product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                            {item.product.category && (
                              <div className="text-sm text-gray-500">
                                {item.product.category}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="1"
                              max={item.product.quantity}
                              value={item.quantity}
                              onChange={(e) => updateProductQuantity(item.product._id, e.target.value)}
                              className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) => updateProductPrice(item.product._id, e.target.value)}
                              className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeProductFromSale(item.product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total and Submit */}
        {selectedProducts.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Order Summary
                </h3>
                <div className="text-2xl font-bold text-gray-900">
                  Total: {formatCurrency(calculateTotal())}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerInfo({ name: '', email: '', phone: '', address: '' });
                    setSelectedProducts([]);
                    setErrors({});
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete Sale & Generate Receipt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewSale;
