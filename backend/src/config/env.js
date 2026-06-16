const dotenv = require('dotenv');
const joi = require('joi');

dotenv.config();

const envVarsSchema = joi.object({
  NODE_ENV: joi.string().valid('production', 'development', 'test').required(),
  PORT: joi.number().default(3000),
  REDIS_URL: joi.string().required().description('Redis url'),
  GEMINI_API_KEY: joi.string().required().description('Gemini API Key'),
  MONGODB_URI: joi.string().required().description('MongoDB URI'),
  JWT_ACCESS_SECRET: joi.string().required().description('JWT Access Secret'),
  JWT_REFRESH_SECRET: joi.string().required().description('JWT Refresh Secret'),
  MSG91_AUTH_KEY: joi.string().required().description('MSG91 Auth Key'),
  MSG91_TEMPLATE_ID: joi.string().required().description('MSG91 Template ID'),
  RESEND_API_KEY: joi.string().required().description('Resend API Key')
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  redis: {
    url: envVars.REDIS_URL,
  },
  gemini: {
    apiKey: envVars.GEMINI_API_KEY,
  },
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
  },
  msg91: {
    authKey: envVars.MSG91_AUTH_KEY,
    templateId: envVars.MSG91_TEMPLATE_ID,
  },
  resend: {
    apiKey: envVars.RESEND_API_KEY,
  }
};
