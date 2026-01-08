
import * as salesService from '../services/salesReportService.js'

export const getSalesReport = async (req, res) => {
  try {
    const reportData = await salesService.generateSalesReport(req.query);
    return res.status(200).json(reportData);

  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
};

