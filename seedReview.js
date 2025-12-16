import mongoose from 'mongoose';
import 'dotenv/config'; // Used to load environment variables in ESM

// 1. IMPORT YOUR MODELS (Adjust paths if needed!)
import Product from './models/products.js';
import User from './models/users.js';
import Review from './models/review.js';

// 2. CONFIG
const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/your_db_name';
const REVIEWS_PER_PRODUCT = 5; // How many reviews per product?

// 3. DUMMY DATA POOL
const comments = [
  "Absolutely love the quality!",
  "Fits well but the color is slightly different.",
  "Fast delivery and great packaging.",
  "Not worth the price, honestly.",
  "Best purchase I've made this year.",
  "Fabric feels premium, very comfortable.",
  "Size is a bit small, order one size up.",
  "Okay for daily use."
];

const seedReviews = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    // 4. GET EXISTING DATA
    const products = await Product.find({});
    // Note: Assuming 'name' field might not exist on User, but will use 'firstName' or 'lastName' if available.
    // If the User model only has 'firstName' and 'lastName', you might need to adjust:
    // userName: `${randomUser.firstName} ${randomUser.lastName}`
    const users = await User.find({});

    if (products.length === 0 || users.length === 0) {
      console.log('❌ Error: You need Products and Users in your DB first.');
      process.exit(0); // Exit gracefully if prerequisites not met
    }

    console.log(`Found ${products.length} products. Generating reviews...`);

    // 5. LOOP THROUGH PRODUCTS
    for (const product of products) {
      let totalRating = 0;
      let reviewCount = 0;

      // Delete old reviews for this product (Optional: keeps it clean)
      await Review.deleteMany({ product: product._id });

      // Create new reviews
      for (let i = 0; i < REVIEWS_PER_PRODUCT; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomRating = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // Random rating 3-5
        const randomComment = comments[Math.floor(Math.random() * comments.length)];

        // Determine user name: Use firstName, or fall back to 'Anonymous'
        const userName = randomUser.firstName || 'Anonymous'; 

        // Create Review Document
        await Review.create({
          product: product._id,
          user: randomUser._id,
          userName: userName, // Use the determined name
          rating: randomRating,
          comment: randomComment,
          isVerifiedPurchase: true,
          isApproved: true,
          createdAt: new Date()
        });

        totalRating += randomRating;
        reviewCount++;
      }

      // 6. UPDATE PRODUCT AGGREGATES
      // This is crucial so your ProductCard shows the stars immediately
      const averageRating = (totalRating / reviewCount).toFixed(1);

      product.rating = {
        average: Number(averageRating),
        count: reviewCount
      };

      await product.save();
      process.stdout.write('.'); // Show progress dot
    }

    console.log('\n✅ Success! All products have new reviews and updated ratings.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

seedReviews();