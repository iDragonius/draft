import { Strapi } from "@strapi/strapi";
import visitorSchemas from "./validation/visitor";
import { errors } from "@strapi/utils";
const { ApplicationError } = errors;
export default ({ strapi }: { strapi: Strapi }) => ({
  async getVisitorToken(ctx) {
    const token = await strapi
      .plugin("auth")
      .service("visitorService")
      .createVisitor();
    ctx.send({ token });
  },
  async validateVisitor(ctx) {
    console.log(ctx);
    if (!ctx.request.query.token || ctx.request.query.token === "") {
      throw new ApplicationError("You need provide token");
    }
    return ctx.request.query.token;
  },
});
