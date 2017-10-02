var Joi = require("joi-browser");

module.exports = {
  title: Joi.string()
    .min(1)
    .required()
    .label("Title"),
  "platform-type": Joi.string()
    .required()
    .valid("satellite", "aircraft", "uav", "ballon", "kite"),
  sensor: Joi.string()
    .required()
    .label("Sensor"),
  "date-start": Joi.date()
    .required()
    .label("Date start"),
  "date-end": Joi.date()
    .min(Joi.ref("date-start"))
    .max("now")
    .required()
    .label("Date End"),
  "tile-url": Joi.string()
    .allow("")
    .label("Tile service"),
  provider: Joi.string()
    .required()
    .label("Provider"),
  "contact-type": Joi.string()
    .required()
    .valid("uploader", "other"),
  "contact-name": Joi.label("Name").when("contact-type", {
    is: "other",
    then: Joi.string().required()
  }),
  "contact-email": Joi.label("Email").when("contact-type", {
    is: "other",
    then: Joi.string()
      .email()
      .required()
  }),
  license: Joi.string()
    .required()
    .label("License"),
  tags: Joi.string()
    .allow("")
    .label("Tags")
};
