import * as dashboardService from '../services/dashboardServices.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStatsService();
    
    res.status(200).json({
      success: true,
      ...data 
    });

  } catch (error) {
    next(error);
  }
};