export default [
  {
    method: "POST",
    path: "/otp/register",
    handler: "otpAuthController.otpSendNonExistUser",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/otp/login",
    handler: "otpAuthController.otpSendExistUser",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/otp/login/confirm",
    handler: "otpAuthController.otpConfirmExistUser",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/otp/register/confirm",
    handler: "otpAuthController.otpConfirmNonExistUser",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/visitor",
    handler: "visitorController.getVisitorToken",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/visitor/validate",
    handler: "visitorController.validateVisitor",
    config: {
      policies: [],
      auth: false,
    },
  },
];
