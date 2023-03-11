import { Strapi } from "@strapi/strapi";
import { HttpStatus, UserStatus } from "../lib";
import dayjs from "dayjs";
import { errors } from "@strapi/utils";
const expireTime = "3 minutes";
const { ApplicationError } = errors;
export default ({ strapi }: { strapi: Strapi }) => ({
  async otpSendExistUser(ctx) {
    const { phone, country_code } = ctx.request.body;
    const possibleUser = await strapi.query("plugin::auth.auth").findOne({
      where: {
        phone: phone,
        country_code: {
          code: country_code,
        },
      },
      populate: {
        user: true,
      },
    });

    const date = dayjs();
    const expireDate = date.add(3, "m").format();
    if (!possibleUser) {
      throw new ApplicationError("user with this phone is not exist", {
        redirect: "to.register",
      });
    }

    await strapi.query("plugin::auth.otp").create({
      data: {
        code: this.createCode(),
        expire_date: expireDate,
        auth: possibleUser,
      },
    });
    return { status: UserStatus.EXIST, expireTime };
  },
  async otpSendNonExistUser(ctx) {
    const { phone, country_code } = ctx.request.body;
    const possibleUser = await strapi.query("plugin::auth.auth").findOne({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
      populate: {
        user: true,
      },
    });
    const checkCountryCode = await strapi
      .query("plugin::auth.country-code")
      .findOne({
        where: {
          code: country_code,
        },
      });
    if (!checkCountryCode) {
      throw new ApplicationError("Country with this code does not supported", {
        redirect: "to.login",
      });
    }
    if (possibleUser) {
      throw new ApplicationError("user with this phone is exist", {
        redirect: "to.login",
      });
    }
    const date = dayjs();
    const expireDate = date.add(3, "m").format();
    let tempUser = await strapi.query("plugin::auth.temp-auth").findOne({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
    });

    if (!tempUser) {
      tempUser = await strapi.query("plugin::auth.temp-auth").create({
        data: {
          phone,
          country_code: {
            connect: { id: checkCountryCode.id },
          },
        },
      });
    }

    await strapi.query("plugin::auth.otp").create({
      data: {
        code: this.createCode(),
        expire_date: expireDate,
        "temp-auth": tempUser,
      },
    });
  },
  async otpConfirmExistUser(ctx) {
    const { phone, country_code, code } = ctx.request.body;

    const date = dayjs();
    const user = await strapi.query("plugin::auth.auth").findOne({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
      populate: {
        country_code: true,
        user: {
          populate: {
            profile: true,
          },
        },
        otps: true,
      },
    });

    if (!user) {
      throw new ApplicationError("Invalid credentials", {
        code: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.try_count === 3) {
      if (user.blocked_date < date.format()) {
        await strapi.query("plugin::auth.auth").update({
          where: {
            id: user.id,
          },
          data: {
            try_count: 0,
            blocked_date: null,
          },
        });
        user.try_count = 0;
      } else {
        throw new ApplicationError("user blocked", {
          code: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const findCode = user.otps.find((otp) => otp.code === code && !otp.is_used);

    if (!findCode) {
      if (user.try_count + 1 === 3) {
        const blockDate = date.add(1, "d").format();
        await strapi.query("plugin::auth.auth").update({
          where: {
            user: user.user,
          },
          data: {
            try_count: user.try_count + 1,
            blocked_date: blockDate,
          },
        });
      } else {
        await strapi.query("plugin::auth.auth").update({
          where: {
            user: user.user,
          },
          data: {
            try_count: user.try_count + 1,
          },
        });
      }
      throw new ApplicationError("invalid otp");
    }

    const expireDate = dayjs(findCode.expire_date).format();

    if (expireDate < date.format()) {
      throw new ApplicationError("Code has expired", {
        code: HttpStatus.BAD_REQUEST,
      });
    }

    await strapi.query("plugin::auth.otp").update({
      where: {
        id: findCode.id,
      },
      data: {
        is_used: true,
      },
    });

    const jwt = await strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.user.id,
    });
    console.log(user);

    return {
      jwt,
      initials:
        user.user.profile.first_name[0] + user.user.profile.last_name[0],
    };
  },

  async otpConfirmNonExistUser(ctx) {
    const {
      first_name,
      last_name,
      father_name,
      gender,
      bdate,
      phone,
      country_code,
      code,
    } = ctx.request.body;

    const possibleUser = await strapi.query("plugin::auth.auth").findOne({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
    });
    if (possibleUser) {
      throw new ApplicationError("Access Denied! user alredy exist", {
        redirect: "to.login",
      });
    }

    const tempAuth = await strapi.query("plugin::auth.temp-auth").findOne({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
      populate: {
        otps: true,
      },
    });
    if (!tempAuth) {
      throw new ApplicationError("Access Denied! phone dont find", {
        redirect: "to.login",
      });
    }
    const date = dayjs();
    if (tempAuth.try_count === 3) {
      if (tempAuth.blocked_date < date.format()) {
        await strapi.query("plugin::auth.temp-auth").update({
          where: {
            id: tempAuth.id,
          },
          data: {
            try_count: 0,
            blocked_date: null,
          },
        });
        tempAuth.try_count = 0;
      } else {
        throw new ApplicationError("user blocked", {
          code: HttpStatus.BAD_REQUEST,
        });
      }
    }
    const checkCountryCode = await strapi
      .query("plugin::auth.country-code")
      .findOne({
        data: {
          code: country_code,
        },
      });
    if (!checkCountryCode) {
      throw new ApplicationError("Country with this code does not supported", {
        redirect: "to.login",
      });
    }
    const findCode = tempAuth.otps.find(
      (otp) => otp.code === code && !otp.is_used
    );
    if (!findCode) {
      if (tempAuth.try_count + 1 === 3) {
        const blockDate = date.add(1, "d").format();
        await strapi.query("plugin::auth.temp-auth").update({
          where: {
            id: tempAuth.id,
          },
          data: {
            try_count: tempAuth.try_count + 1,
            blocked_date: blockDate,
          },
        });
      } else {
        await strapi.query("plugin::auth.temp-auth").update({
          where: {
            id: tempAuth.id,
          },
          data: {
            try_count: tempAuth.try_count + 1,
          },
        });
      }
      throw new ApplicationError("invalid otp");
    }
    await strapi.query("plugin::auth.temp-auth").delete({
      where: {
        phone,
        country_code: {
          code: country_code,
        },
      },
    });
    const defaultRole = await this.getDefaultRole();
    const newUserAuth = await strapi.query("plugin::auth.auth").create({
      data: {
        phone,
        country_code: {
          connect: {
            id: checkCountryCode.id,
          },
        },
      },
    });
    const newUser = await strapi
      .query("plugin::users-permissions.user")
      .create({
        data: {
          role: defaultRole.id,
          auth: newUserAuth,
        },
      });

    await strapi.query("api::user-profile.user-profile").create({
      data: {
        user: newUser,
        first_name,
        last_name,
        father_name,
        gender,
        bdate,
      },
    });

    const jwt = await strapi.plugins["users-permissions"].services.jwt.issue({
      id: newUser.id,
    });
    return {
      jwt,
      initials: first_name[0] + last_name[0],
    };
  },
  createCode() {
    return Math.floor(1000 + Math.random() * 9000);
  },
  async getDefaultRole() {
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });
    const settings = await pluginStore.get({ key: "advanced" });
    return await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: settings.default_role } });
  },
});
