"use strict";

var express = require("express");

var _require = require("../controllers/userController"),
    registerUser = _require.registerUser,
    loginUser = _require.loginUser,
    logout = _require.logout,
    forgotPassword = _require.forgotPassword,
    resetPassword = _require.resetPassword,
    getUserDetails = _require.getUserDetails,
    updatePassword = _require.updatePassword,
    updateProfile = _require.updateProfile;

var _require2 = require("../middleware/auth"),
    isAuthenticatedUser = _require2.isAuthenticatedUser,
    authorizeRoles = _require2.authorizeRoles;

var router = express.Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
module.exports = router;