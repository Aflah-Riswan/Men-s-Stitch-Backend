import * as transactionService from '../services/transactionService.js' 

export const getTransactions = async (req, res, next) => {
  try {
    const response = await transactionService.getTransactions(req.query);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};