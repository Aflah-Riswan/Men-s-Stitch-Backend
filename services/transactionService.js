import Transaction from "../models/transactions.js";
import User from "../models/users.js";

export const getTransactions = async (data) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    type,
    method,
    sort,
  } = data;

  // 1. Setup Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // 2. Initialize Filter
  const filter = {}; 

  // 3. Apply Filters (Type & Method)
  if (type && type !== 'All') {
    filter.transactionType = type; // 'Credit' or 'Debit'
  }

  if (method && method !== 'All') {
    filter.method = method; // 'Wallet' or 'Razorpay'
  }

  // 4. Apply Search (Payment ID OR User Name/Email)
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };

    // Step A: Find users matching the search term
    const matchingUsers = await User.find({
      $or: [
        { firstName: searchRegex },
        { email: searchRegex }
      ]
    }).select('_id');

    const userIds = matchingUsers.map(user => user._id);

    // Step B: Search Transactions matching Payment ID OR User IDs
    filter.$or = [
      { paymentId: searchRegex },
      { description: searchRegex },
      { user: { $in: userIds } }
    ];
  }

  // 5. Apply Sorting
  let sortOptions = { createdAt: -1 }; // Default: Newest first
  
  if (sort === 'oldest') sortOptions = { createdAt: 1 };
  if (sort === 'amount_high') sortOptions = { amount: -1 };
  if (sort === 'amount_low') sortOptions = { amount: 1 };

  // 6. Execute Query
  const transactions = await Transaction.find(filter)
    .populate('user', 'firstName email profilePic') // Get user details
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // 7. Get Total Count for Pagination
  const totalCount = await Transaction.countDocuments(filter);

  return {
    success: true,
    transactions,
    pagination: {
      totalDocs: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum
    }
  };
};