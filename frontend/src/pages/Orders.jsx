import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLowStockProducts, fetchProducts, createProduct, updateProduct } from '../store/slices/productSlice';

const Orders = () => {
  const dispatch = useDispatch();
  const { products, lowStockProducts, loading, error } = useSelector((state) => state.products);
  const [orderList, setOrderList] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    wholesaler: '',
    quantity: '',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInventoryList, setShowInventoryList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchLowStockProducts());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    // Initialize order list with low stock products
    if (lowStockProducts.length > 0) {
      const initialOrderList = lowStockProducts.map(product => ({
        id: product._id,
        name: product.name,
        wholesaler: product.wholesaler,
        currentStock: product.quantity,
        alertLevel: product.lowStockThreshold,
        suggestedQuantity: Math.max(product.lowStockThreshold * 2, 10),
        orderQuantity: Math.max(product.lowStockThreshold * 2, 10),
        notes: '',
        isSelected: true
      }));
      setOrderList(initialOrderList);
    }
  }, [lowStockProducts]);

  const handleQuantityChange = (id, quantity) => {
    setOrderList(prev => prev.map(item =>
      item.id === id ? { ...item, orderQuantity: parseInt(quantity) || 0 } : item
    ));
  };

  const handleNotesChange = (id, notes) => {
    setOrderList(prev => prev.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
  };

  const handleSelectionChange = (id, isSelected) => {
    setOrderList(prev => prev.map(item =>
      item.id === id ? { ...item, isSelected } : item
    ));
  };

  const handleAddNewProduct = () => {
    if (!newProduct.name.trim() || !newProduct.wholesaler.trim() || !newProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const newOrderItem = {
      id: `new-${Date.now()}`,
      name: newProduct.name,
      wholesaler: newProduct.wholesaler,
      currentStock: 0,
      alertLevel: 0,
      suggestedQuantity: parseInt(newProduct.quantity),
      orderQuantity: parseInt(newProduct.quantity),
      notes: newProduct.notes,
      isSelected: true,
      isNew: true
    };

    setOrderList(prev => [...prev, newOrderItem]);
    setNewProduct({ name: '', wholesaler: '', quantity: '', notes: '' });
    setShowAddForm(false);
  };

  const handleRemoveItem = (id) => {
    setOrderList(prev => prev.filter(item => item.id !== id));
  };

  const handleAddExistingProduct = (product, quantity = 10) => {
    // Check if product is already in order list
    const existingItem = orderList.find(item => item.id === product._id);

    if (existingItem) {
      // Update quantity if already exists
      setOrderList(prev => prev.map(item =>
        item.id === product._id
          ? { ...item, orderQuantity: item.orderQuantity + quantity, isSelected: true }
          : item
      ));
    } else {
      // Add new item to order list
      const newOrderItem = {
        id: product._id,
        name: product.name,
        wholesaler: product.wholesaler,
        currentStock: product.quantity,
        alertLevel: product.lowStockThreshold,
        suggestedQuantity: Math.max(product.lowStockThreshold * 2, 10),
        orderQuantity: quantity,
        notes: '',
        isSelected: true,
        isFromInventory: true
      };

      setOrderList(prev => [...prev, newOrderItem]);
    }
  };

  // Filter products for inventory list
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.wholesaler.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get products not already in order list
  const availableProducts = filteredProducts.filter(product =>
    !orderList.some(orderItem => orderItem.id === product._id)
  );

  const handleAddToInventory = async (orderItem) => {
    const confirmMessage = orderItem.isNew
      ? `Add "${orderItem.name}" as a new product to inventory with ${orderItem.orderQuantity} units?`
      : `Add ${orderItem.orderQuantity} units to existing "${orderItem.name}" inventory?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (orderItem.isNew) {
        // Create new product in inventory
        const productData = {
          name: orderItem.name,
          description: `Added from order list`,
          wholesaler: orderItem.wholesaler,
          price: 0, // Default cost price - user can edit later
          quantity: orderItem.orderQuantity,
          lowStockThreshold: 5, // Default threshold
          category: 'General'
        };

        await dispatch(createProduct(productData)).unwrap();
        alert(`✅ "${orderItem.name}" has been added to inventory with ${orderItem.orderQuantity} units!\n\n💡 Note: Cost price is set to ₹0. Please update it in the Products section.`);
      } else {
        // Update existing product quantity
        const existingProduct = products.find(p => p._id === orderItem.id);
        if (existingProduct) {
          const updatedProductData = {
            ...existingProduct,
            quantity: existingProduct.quantity + orderItem.orderQuantity
          };

          await dispatch(updateProduct({
            id: orderItem.id,
            productData: updatedProductData
          })).unwrap();

          alert(`✅ "${orderItem.name}" inventory updated!\n\nAdded: ${orderItem.orderQuantity} units\nNew total: ${existingProduct.quantity + orderItem.orderQuantity} units`);
        }
      }

      // Remove item from order list after adding to inventory
      handleRemoveItem(orderItem.id);

      // Refresh products list
      dispatch(fetchProducts());

    } catch (error) {
      alert(`❌ Failed to add "${orderItem.name}" to inventory: ${error}`);
    }
  };

  const handleAddAllToInventory = async () => {
    const selectedItems = orderList.filter(item => item.isSelected && item.orderQuantity > 0);

    if (selectedItems.length === 0) {
      alert('Please select at least one item to add to inventory');
      return;
    }

    if (!window.confirm(`Are you sure you want to add ${selectedItems.length} selected items to inventory?`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of selectedItems) {
      try {
        if (item.isNew) {
          // Create new product
          const productData = {
            name: item.name,
            description: `Added from order list`,
            wholesaler: item.wholesaler,
            price: 0,
            quantity: item.orderQuantity,
            lowStockThreshold: 5,
            category: 'General'
          };
          await dispatch(createProduct(productData)).unwrap();
        } else {
          // Update existing product
          const existingProduct = products.find(p => p._id === item.id);
          if (existingProduct) {
            const updatedProductData = {
              ...existingProduct,
              quantity: existingProduct.quantity + item.orderQuantity
            };
            await dispatch(updateProduct({
              id: item.id,
              productData: updatedProductData
            })).unwrap();
          }
        }
        successCount++;
      } catch (error) {
        console.error(`Failed to add ${item.name}:`, error);
        failCount++;
      }
    }

    // Remove successfully added items from order list
    if (successCount > 0) {
      const successfulItems = selectedItems.slice(0, successCount);
      successfulItems.forEach(item => handleRemoveItem(item.id));
      dispatch(fetchProducts());
    }

    // Show summary
    if (failCount === 0) {
      alert(`✅ Successfully added ${successCount} items to inventory!`);
    } else {
      alert(`⚠️ Added ${successCount} items successfully, ${failCount} failed.`);
    }
  };

  const generateOrderSummary = () => {
    const selectedItems = orderList.filter(item => item.isSelected && item.orderQuantity > 0);

    if (selectedItems.length === 0) {
      alert('Please select at least one item to order');
      return;
    }

    // Group by wholesaler
    const ordersByWholesaler = selectedItems.reduce((acc, item) => {
      if (!acc[item.wholesaler]) {
        acc[item.wholesaler] = [];
      }
      acc[item.wholesaler].push(item);
      return acc;
    }, {});

    // Generate order summary text
    let orderSummary = "ORDER SUMMARY\n";
    orderSummary += "================\n\n";

    Object.entries(ordersByWholesaler).forEach(([wholesaler, items]) => {
      orderSummary += `WHOLESALER: ${wholesaler}\n`;
      orderSummary += "-".repeat(30) + "\n";

      items.forEach(item => {
        orderSummary += `• ${item.name} - Qty: ${item.orderQuantity}`;
        if (item.notes) {
          orderSummary += ` (${item.notes})`;
        }
        orderSummary += "\n";
      });

      orderSummary += "\n";
    });

    orderSummary += `Total Items: ${selectedItems.length}\n`;
    orderSummary += `Total Quantity: ${selectedItems.reduce((sum, item) => sum + item.orderQuantity, 0)}\n`;

    // Copy to clipboard or download as text file
    navigator.clipboard.writeText(orderSummary).then(() => {
      alert('Order summary copied to clipboard!');
    }).catch(() => {
      // Fallback: create downloadable text file
      const blob = new Blob([orderSummary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-summary-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Order summary downloaded as text file!');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            To Order
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Medicines below alert quantity and additional items to order
          </p>
        </div>
        <div className="mt-4 flex flex-wrap md:mt-0 md:ml-4 gap-3">
          <button
            onClick={() => setShowInventoryList(!showInventoryList)}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="mr-2">📦</span>
            Add from Inventory
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mr-2">➕</span>
            Add New Medicine
          </button>
          <button
            onClick={handleAddAllToInventory}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="mr-2">📦</span>
            Add Selected to Inventory
          </button>
          <button
            onClick={generateOrderSummary}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mr-2">📋</span>
            Generate Order Summary
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {lowStockProducts.length} medicine(s) below alert quantity that need to be reordered.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Add New Medicine to Order
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wholesaler *
                </label>
                <input
                  type="text"
                  value={newProduct.wholesaler}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, wholesaler: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter wholesaler name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <input
                  type="text"
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewProduct}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add to Order List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add from Inventory */}
      {showInventoryList && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Add Medicines from Inventory
              </h3>
              <button
                onClick={() => setShowInventoryList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search medicines by name, wholesaler, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Products Grid */}
            <div className="max-h-96 overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No medicines found matching your search.' : 'All medicines are already in your order list.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableProducts.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                          {product.category && (
                            <p className="text-xs text-gray-500">{product.category}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.quantity <= product.lowStockThreshold
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Stock: {product.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-3">
                        <p>Wholesaler: {product.wholesaler}</p>
                        <p>Alert Level: {product.lowStockThreshold}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          defaultValue="10"
                          className="w-16 text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          id={`qty-${product._id}`}
                        />
                        <button
                          onClick={() => {
                            const qtyInput = document.getElementById(`qty-${product._id}`);
                            const quantity = parseInt(qtyInput.value) || 10;
                            handleAddExistingProduct(product, quantity);
                          }}
                          className="flex-1 bg-indigo-600 text-white text-xs px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order List ({orderList.filter(item => item.isSelected).length} selected)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Use "Add to Inventory" to receive ordered items into your stock
              </p>
            </div>
            {orderList.filter(item => item.isSelected).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400 text-sm">💡</span>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-blue-700">
                      <strong>Tip:</strong> When you receive your order, use "Add to Inventory" to automatically update your stock levels.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {orderList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items to order. All medicines are adequately stocked!</p>
              <p className="text-sm mt-2">Use "Add New Medicine" to add items to your order list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wholesaler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderList.map((item) => (
                    <tr key={item.id} className={item.isSelected ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={(e) => handleSelectionChange(item.id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                          {item.isNew && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              New
                            </span>
                          )}
                          {item.isFromInventory && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              From Inventory
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.wholesaler}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.currentStock}
                        {!item.isNew && item.currentStock <= item.alertLevel && (
                          <span className="ml-2 text-red-600 text-xs">⚠️ Low</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.orderQuantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Notes..."
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToInventory(item)}
                            className="text-green-600 hover:text-green-900 text-xs bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
                            title="Add to Inventory"
                          >
                            📦 Add to Inventory
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-900 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                            title="Remove from Order"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
