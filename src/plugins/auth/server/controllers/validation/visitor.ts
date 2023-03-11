import { yup, validateYupSchema } from "@strapi/utils";
const validateVisitorSchema = yup.object({
  token: yup.string().required(),
});
const visitorSchemas = {
  validateVisitorBody: validateYupSchema(validateVisitorSchema),
};
export default visitorSchemas;
