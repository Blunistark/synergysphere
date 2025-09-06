const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { uploadProfileImage, handleUploadError } = require('../middleware/upload');
const { 
  getProfile, 
  updateProfile, 
  uploadProfileImage: uploadProfileImageController, 
  deleteProfileImage 
} = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/', getProfile);

// Update profile information
router.put('/', updateProfile);

// Upload profile image
router.post('/image', uploadProfileImage, handleUploadError, uploadProfileImageController);

// Delete profile image
router.delete('/image', deleteProfileImage);

module.exports = router;
