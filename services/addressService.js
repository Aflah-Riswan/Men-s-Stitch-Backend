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
export const getAddress = async (userId) => {
  const user = await User.findById({ _id: userId }).select('addresses')
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  return user.addresses
}

export const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById({ _id: userId })
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  const addressToUpdate = user.addresses.id(addressId);
  if (!addressToUpdate) throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');

  if(addressData.isDefault === true) {
     user.addresses.forEach(addr=>addr.isDefault = false)
  }
  addressToUpdate.set(addressData)
  await user.save()
  return user.addresses
}