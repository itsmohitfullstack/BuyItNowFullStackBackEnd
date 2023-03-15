"use strict";

var ErrorHander = require("../utils/errorhander");

var catchAsyncErrors = require("../middleware/catchAsyncErrors");

var User = require("../models/userModel");

var sendToken = require("../utils/jwtToken");

var sendEmail = require("../utils/sendEmail");

var crypto = require("crypto");

var cloudinary = require("cloudinary"); // Register a User


exports.registerUser = catchAsyncErrors(function _callee(req, res, next) {
  var myCloud, _req$body, name, email, password, user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatar",
            width: 300,
            crop: "scale"
          }));

        case 2:
          myCloud = _context.sent;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password;
          _context.next = 6;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            password: password,
            avatar: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url
            }
          }));

        case 6:
          user = _context.sent;
          sendToken(user, 201, res);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Login User

exports.loginUser = catchAsyncErrors(function _callee2(req, res, next) {
  var _req$body2, email, password, user, isPasswordMatched;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password; // checking if user has given password and email both

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHander("Please Enter Email & Password", 400)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 5:
          user = _context2.sent;

          if (user) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHander("Invalid email or password", 401)));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 10:
          isPasswordMatched = _context2.sent;

          if (isPasswordMatched) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHander("Invalid email or password", 401)));

        case 13:
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Logout user

exports.logout = catchAsyncErrors(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
          });
          res.status(200).json({
            success: true,
            message: "Logged Out"
          });

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // Forget Password

exports.forgotPassword = catchAsyncErrors(function _callee4(req, res, next) {
  var user, resetToken, resetPasswordUrl, message;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context4.sent;

          if (user) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHander("User not found", 404)));

        case 5:
          // Get ResetPassword Token
          resetToken = user.getResetPasswordToken();
          _context4.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          //req.protocol}://${req.get("host")
          resetPasswordUrl = "".concat(process.env.FRONTEND_URL, "/password/reset/").concat(resetToken);
          message = "Your password reset token is :- \n\n ".concat(resetPasswordUrl, " \n\n If you have not\n    requested this email then ignore it.");
          _context4.prev = 10;
          _context4.next = 13;
          return regeneratorRuntime.awrap(sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery",
            message: message
          }));

        case 13:
          res.status(200).json({
            success: true,
            message: "Email sent to ".concat(user.email, " successfully")
          });
          _context4.next = 23;
          break;

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](10);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          _context4.next = 22;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 22:
          return _context4.abrupt("return", next(new ErrorHander(_context4.t0.message, 500)));

        case 23:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[10, 16]]);
}); // Reset Password

exports.resetPassword = catchAsyncErrors(function _callee5(req, res, next) {
  var resetPasswordToken, user;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // Creating token hash
          resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
          _context5.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context5.sent;

          if (user) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", next(new ErrorHander("Reset Password Token is Invalid or has been expired", 400)));

        case 6:
          if (!(req.body.password !== req.body.confirmPassword)) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", next(new ErrorHander("Password does not password", 400)));

        case 8:
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          _context5.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // Get User Detail

exports.getUserDetails = catchAsyncErrors(function _callee6(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context6.sent;
          res.status(200).json({
            success: true,
            user: user
          });

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // Update User Password

exports.updatePassword = catchAsyncErrors(function _callee7(req, res, next) {
  var user, isPasswordMatched;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select("+password"));

        case 2:
          user = _context7.sent;
          _context7.next = 5;
          return regeneratorRuntime.awrap(user.comparePassword(req.body.oldPassword));

        case 5:
          isPasswordMatched = _context7.sent;

          if (isPasswordMatched) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", next(new ErrorHander("Old Password is incorrect", 400)));

        case 8:
          if (!(req.body.newPassword !== req.body.confirmPassword)) {
            _context7.next = 10;
            break;
          }

          return _context7.abrupt("return", next(new ErrorHander("Password does not match", 400)));

        case 10:
          user.password = req.body.newPassword;
          _context7.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // Update User Profile

exports.updateProfile = catchAsyncErrors(function _callee8(req, res, next) {
  var newUserData, _user, imageId, myCloud, user;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          newUserData = {
            name: req.body.name,
            email: req.body.email
          };

          if (!(req.body.avatar !== "")) {
            _context8.next = 12;
            break;
          }

          _context8.next = 4;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 4:
          _user = _context8.sent;
          imageId = _user.avatar.public_id;
          _context8.next = 8;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 8:
          _context8.next = 10;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
          }));

        case 10:
          myCloud = _context8.sent;
          newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
          };

        case 12:
          _context8.next = 14;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, newUserData, {
            "new": true,
            runValidators: true,
            useFindAndModify: false
          }));

        case 14:
          user = _context8.sent;
          res.status(200).json({
            success: true
          });

        case 16:
        case "end":
          return _context8.stop();
      }
    }
  });
}); // Get All Users(Admin)

exports.getAllUser = catchAsyncErrors(function _callee9(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(User.find());

        case 2:
          users = _context9.sent;
          res.status(200).json({
            success: true,
            users: users
          });

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
}); // Get Single User (Admin)

exports.getSingleUser = catchAsyncErrors(function _callee10(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context10.sent;

          if (user) {
            _context10.next = 5;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHander("User does not exist with Id :".concat(req.params.id))));

        case 5:
          res.status(200).json({
            success: true,
            user: user
          });

        case 6:
        case "end":
          return _context10.stop();
      }
    }
  });
}); // Update User Role  --- Role

exports.updateUserRole = catchAsyncErrors(function _callee11(req, res, next) {
  var newUserData;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
          };
          _context11.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, newUserData, {
            "new": true,
            runValidators: true,
            useFindAndModify: false
          }));

        case 3:
          res.status(200).json({
            success: true
          });

        case 4:
        case "end":
          return _context11.stop();
      }
    }
  });
}); // Delete User -- Admin

exports.deleteUser = catchAsyncErrors(function _callee12(req, res, next) {
  var user, imageId;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context12.sent;

          if (user) {
            _context12.next = 5;
            break;
          }

          return _context12.abrupt("return", next(new ErrorHander("User does not exist with id: ".concat(req.params.id))));

        case 5:
          ;
          imageId = user.avatar.public_id;
          _context12.next = 9;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 9:
          _context12.next = 11;
          return regeneratorRuntime.awrap(user.remove());

        case 11:
          res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
          });

        case 12:
        case "end":
          return _context12.stop();
      }
    }
  });
});