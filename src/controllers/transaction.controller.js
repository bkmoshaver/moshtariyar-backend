const { Transaction } = require('../models');
const { successResponse } = require('../utils/errorResponse');

/**
 * دریافت لیست تراکنش‌های یک مشتری
 * GET /api/clients/:clientId/transactions
 */
const getClientTransactions = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = { client: clientId };
    if (req.tenantId) query.tenant = req.tenantId;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedService', 'title serviceDate'),
      Transaction.countDocuments(query)
    ]);

    res.json(successResponse({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClientTransactions
};
