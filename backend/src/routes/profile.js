const express = require('express');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { 
  getProfile, 
  updateProfile, 
  uploadProfileImage, 
  deleteProfileImage 
} = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(auth);

// Get current user profile
router.get('/', getProfile);

// Update profile information
router.put('/', updateProfile);

// Upload profile image
router.post('/image', upload.single('profileImage'), uploadProfileImage);

// Delete profile image
router.delete('/image', deleteProfileImage);

module.exports = router;
