import Category from "../models/category.js";


export const calculateBestPrice = async (originalPrice, productSalePrice, productOffer, categoryId) => {

  let finalSalePrice = productSalePrice;
  let activeOfferSource = 'product';
  let activeOfferValue = productOffer;

  if (categoryId) {
    try {
      const category = await Category.findById(categoryId);

      if (category && category.categoryOffer > 0) {
        let categoryDiscountAmount = 0;
        if (category.discountType === 'Percentage') {
          let calculatedAmount = (originalPrice * category.categoryOffer) / 100;

          if (category.maxRedeemable && calculatedAmount > category.maxRedeemable) {
            calculatedAmount = category.maxRedeemable;
          }
          categoryDiscountAmount = calculatedAmount;
        }
 
        else {
          categoryDiscountAmount = category.categoryOffer;
        }

        const categorySalePrice = Math.round(originalPrice - categoryDiscountAmount);

        if (categorySalePrice < productSalePrice) {
          finalSalePrice = categorySalePrice;
          activeOfferSource = 'category';
          activeOfferValue = category.categoryOffer;
        }
      }
    } catch (error) {
      console.log("error found in calculate : ", error)

    }
  }

  if (finalSalePrice < 0) finalSalePrice = 0;
  if (finalSalePrice > originalPrice) finalSalePrice = originalPrice;

  return {
    originalPrice,
    salePrice: finalSalePrice,
    activeOfferSource,
    activeOfferValue
  };
};