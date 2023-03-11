import { Strapi } from "@strapi/strapi";
import otpSchemas from "./validation/otp-auth";
import { HttpStatus } from "../lib/httpStatus.enum";

export default ({ strapi }: { strapi: Strapi }) => ({
  async otpSendNonExistUser(ctx) {
    await otpSchemas.OTPSendBody(ctx.request.body);
    await strapi
      .plugin("auth")
      .service("otpAuthService")
      .otpSendNonExistUser(ctx);

    return ctx.send({
      code: HttpStatus.OK,
      message: "OTP sent",
    });
  },
  async otpSendExistUser(ctx) {
    await otpSchemas.OTPSendBody(ctx.request.body);
    await strapi.plugin("auth").service("otpAuthService").otpSendExistUser(ctx);

    return ctx.send({
      code: HttpStatus.OK,
      message: "OTP sent",
    });
  },
  async otpConfirmExistUser(ctx) {
    await otpSchemas.OTPConfirmBody(ctx.request.body);
    const { jwt, initials } = await strapi
      .plugin("auth")
      .service("otpAuthService")
      .otpConfirmExistUser(ctx);

    ctx.cookies.set("token", jwt, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 14 Day Age
    });

    return ctx.send({
      code: HttpStatus.OK,
      initials,
      jwt,
    });
  },
  async otpConfirmNonExistUser(ctx) {
    await otpSchemas.OTPProfileBody(ctx.request.body);
    const { jwt, initials } = await strapi
      .plugin("auth")
      .service("otpAuthService")
      .otpConfirmNonExistUser(ctx);
    return ctx.send({
      code: HttpStatus.OK,
      initials,
      jwt,
    });
  },
});
