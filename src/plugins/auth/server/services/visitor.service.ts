import { Strapi } from "@strapi/strapi";
import { v4 as uuidv4 } from "uuid";
export default ({ strapi }: { strapi: Strapi }) => ({
  getToken() {
    return uuidv4();
  },

  async createVisitor() {
    const token = this.getToken();
    await strapi.query("plugin::auth.visitor").create({
      data: {
        token,
      },
    });

    return token;
  },
});
