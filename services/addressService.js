import User, { Address } from "../models/users.js"
import AppError from "../utils/appError.js"

export const addNewAddress = async (addressData, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  const duplicateLabel = user.addresses.find(
    (addr) => addr.label.toLowerCase() === addressData.label.toLowerCase()
  );

  if (duplicateLabel) {
    throw new AppError(
      `Address with label '${addressData.label}' already exists. Please choose a different name.`, 
      409, 
      'DUPLICATE_LABEL'
    );
  }
  if (addressData.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  if (user.addresses.length === 0) {
    addressData.isDefault = true;
  }

  user.addresses.push(addressData);
  await user.save();
  return user.addresses;
}