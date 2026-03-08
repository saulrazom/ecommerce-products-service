const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    // Collect data to validate.
    // For multipart/form-data with multer, req.body has the text fields.
    // We merge req.body, req.query, and req.params if needed, 
    // but typically we just validate req.body against schema.body
    
    // For this generic validator, let's validate against whatever parts are defined in schema
    const validations = [];
    
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, { abortEarly: false, allowUnknown: true });
      if (error) {
        validations.push(...error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
      } else {
        req.body = value; // Apply type conversions from Joi
      }
    }

    // You can extend to path/query validation similarly later if needed
    // if (schema.query) ...

    if (validations.length > 0) {
      return res.status(400).json({ error: 'Validation Error', details: validations });
    }

    next();
  };
};

module.exports = validate;
