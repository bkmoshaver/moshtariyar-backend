const User = require('../models/User');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Get current user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { 
      name, 
      username, 
      bio, 
      links, 
      avatar,
      phone,
      address,
      postalCode,
      privacy
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json(errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'کاربر یافت نشد'));
    }

    // Check username uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json(errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این نام کاربری قبلاً استفاده شده است'));
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (links) user.links = links;
    if (avatar !== undefined) user.avatar = avatar;
    
    // New fields
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (postalCode !== undefined) user.postalCode = postalCode;
    
    if (privacy) {
      user.privacy = {
        ...user.privacy,
        ...privacy
      };
    }

    await user.save();

    res.json(successResponse(user, 'پروفایل با موفقیت به‌روزرسانی شد'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get public profile by username
 * GET /api/public/profile/:username
 */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json(errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'کاربر یافت نشد'));
    }

    // Filter fields based on privacy settings
    const publicProfile = {
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      links: user.links ? user.links.filter(l => l.active) : [],
      // Only show if privacy allows
      phone: user.privacy?.showPhone ? user.phone : undefined,
      address: user.privacy?.showAddress ? user.address : undefined,
      postalCode: user.privacy?.showPostalCode ? user.postalCode : undefined,
      privacy: user.privacy // Send privacy settings so frontend knows what to show
    };

    res.json(successResponse(publicProfile));
  } catch (error) {
    next(error);
  }
};
