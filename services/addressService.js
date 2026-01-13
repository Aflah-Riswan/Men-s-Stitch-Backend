import User, { Address } from "../models/users.js"
import AppError from "../utils/appError.js"

export const addNewAddress = async (addressData, userId) => {

  const user = await User.findById(userId);
  if (user.isBlocked) {
    throw new AppError('You are blocked ', 403, 'USER-IS_BLOCKED')
  }
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

  const user = await User.findById({ _id: userId }).select('addresses isBlocked')
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')

  if (user.isBlocked) throw new AppError('You are Blocked', 403, 'USER_IS_BLOCKED')
    
  return user.addresses
}

export const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById({ _id: userId })
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  const addressToUpdate = user.addresses.id(addressId);
  if (!addressToUpdate) throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');

  if (addressData.isDefault === true) {
    user.addresses.forEach(addr => addr.isDefault = false)
  }
  addressToUpdate.set(addressData)
  await user.save()
  return user.addresses
}