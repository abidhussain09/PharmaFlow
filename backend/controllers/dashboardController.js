const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Get dashboard analytics for a retailer
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const retailerId = req.retailer.id;
    const { period = '1month' } = req.query; // 1month, 6months, 1year

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default: // 1month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Get sales data for the period
    const sales = await Sale.find({
      retailerId,
      saleDate: { $gte: startDate }
    }).populate('products.product');

    // Calculate total sales and profit
    let totalSales = 0;
    let totalProfit = 0;
    const dailyData = {};

    sales.forEach(sale => {
      totalSales += sale.totalAmount;

      // Calculate profit using stored cost prices
      sale.products.forEach(item => {
        const costPrice = item.costPrice || 0; // Cost price stored in sale
        const sellingPrice = item.price; // Selling price
        const profit = (sellingPrice - costPrice) * item.quantity;
        totalProfit += profit;
      });

      // Group by date for chart data
      const dateKey = sale.saleDate.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { sales: 0, profit: 0 };
      }
      dailyData[dateKey].sales += sale.totalAmount;

      sale.products.forEach(item => {
        const costPrice = item.costPrice || 0;
        const sellingPrice = item.price;
        const profit = (sellingPrice - costPrice) * item.quantity;
        dailyData[dateKey].profit += profit;
      });
    });

    // Convert daily data to array format for charts
    const chartData = Object.keys(dailyData)
      .sort()
      .map(date => ({
        date,
        sales: dailyData[date].sales,
        profit: dailyData[date].profit
      }));

    // Get additional stats
    const totalProducts = await Product.countDocuments({ retailer: retailerId });
    const totalCustomers = await Customer.countDocuments({ retailerId });
    const lowStockProducts = await Product.countDocuments({
      retailer: retailerId,
      $expr: { $lt: ['$quantity', '$lowStockThreshold'] }
    });

    res.json({
      summary: {
        totalSales,
        totalProfit,
        totalProducts,
        totalCustomers,
        lowStockProducts
      },
      chartData,
      period
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dashboard analytics', 
      error: error.message 
    });
  }
};

// Get recent sales for dashboard
exports.getRecentSales = async (req, res) => {
  try {
    const retailerId = req.retailer.id;
    const limit = parseInt(req.query.limit) || 10;

    const recentSales = await Sale.find({ retailerId })
      .populate('customer', 'name email')
      .populate('products.product', 'name')
      .sort({ saleDate: -1 })
      .limit(limit);

    res.json(recentSales);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching recent sales', 
      error: error.message 
    });
  }
};

// Get sales summary by date range
exports.getSalesSummary = async (req, res) => {
  try {
    const retailerId = req.retailer.id;
    const { startDate, endDate } = req.query;

    const matchConditions = { retailerId };
    
    if (startDate && endDate) {
      matchConditions.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Sale.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json(summary[0] || { totalSales: 0, totalTransactions: 0, averageOrderValue: 0 });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching sales summary', 
      error: error.message 
    });
  }
};
