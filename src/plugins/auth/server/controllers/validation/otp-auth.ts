import { yup, validateYupSchema } from "@strapi/utils";

const OTPProfileSchema = yup.object({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  father_name: yup.string().required(),
  bdate: yup.string().required(),
  gender: yup.string().required(),
  country_code: yup.string().required(),
  phone: yup.string().required(),
  code: yup.string().required().length(4),
});
const OTPConfirmSchema = yup.object({
  country_code: yup.string().required(),
  phone: yup.string().required(),
  code: yup.string().required().length(4),
});
const OTPSendSchema = yup.object({
  country_code: yup.string().required(),
  phone: yup.string().required(),
});
const otpSchemas = {
  OTPProfileBody: validateYupSchema(OTPProfileSchema),
  OTPConfirmBody: validateYupSchema(OTPConfirmSchema),
  OTPSendBody: validateYupSchema(OTPSendSchema),
};
export default otpSchemas;
