
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/products'); // ⚠️ Check this path matches your file structure

dotenv.config();

// 1. DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/your_database_name';

// 2. THE DUMMY DATA (Common Questions)
const faqPool = [
  {
    question: "What is the estimated delivery time?",
    answer: "Standard delivery usually takes 3-5 business days. Express shipping is available at checkout."
  },
  {
    question: "Do you offer returns or exchanges?",
    answer: "Yes, we have a 30-day return policy for unworn items with original tags attached."
  },
  {
    question: "How do I choose the right size?",
    answer: "Please refer to our size chart located just above the size selection buttons. If you are between sizes, we recommend sizing up."
  },
  {
    question: "Is the color accurate to the images?",
    answer: "We try our best to capture the true color, but slight variations may occur due to lighting and screen settings."
  },
  {
    question: "What are the care instructions?",
    answer: "Machine wash cold with like colors. Tumble dry low or hang dry to preserve fabric quality."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to select international locations. Shipping costs will be calculated at checkout."
  }
];

const seedFaqs = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    // 3. GET ALL PRODUCTS
    const products = await Product.find({});
    console.log(`Found ${products.length} products. Adding FAQs...`);

    // 4. LOOP AND UPDATE
    for (const product of products) {
      
      // Pick 3 random FAQs from the pool
      const shuffled = faqPool.sort(() => 0.5 - Math.random());
      const selectedFaqs = shuffled.slice(0, 3); // Get first 3

      // Update the product
      product.faqs = selectedFaqs;
      
      await product.save();
    }

    console.log('✅ Success! FAQs added to all products.');
    process.exit();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedFaqs();