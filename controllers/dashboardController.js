import * as dashboardService from '../services/dashboardServices.js';

export const getDashboardStats = async (req, res, next) => {
  try {

    // Default to 'monthly' if no filter is provided
    const { filter } = req.query;

   
    const data = await dashboardService.getDashboardStatsService(filter);
    
    res.status(200).json({
      success: true,
      ...data 
    });

  } catch (error) {
    next(error);
  }
};