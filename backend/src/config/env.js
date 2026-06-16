const dotenv = require('dotenv');
const joi = require('joi');

dotenv.config();

const envVarsSchema = joi.object({
  NODE_ENV: joi.string().valid('production', 'development', 'test').required(),
  PORT: joi.number().default(3000),
  REDIS_URL: joi.string().required().description('Redis url'),
  GEMINI_API_KEY: joi.string().required().description('Gemini API Key')
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
  }
};
