import dayjs from "dayjs";
export default {
  myJob: {
    task: ({ strapi }) => {
      const date = dayjs().format();
      strapi.query("plugin::auth.otp").delete({
        where: {
          expire_date: {
            $lt: date,
          },
        },
      });
    },
    options: {
      rule: "0 0 * * *",
    },
  },
};
