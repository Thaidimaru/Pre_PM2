/**
 * Netlify Function adapter for Survey Control Room API
 * Named survey-api to avoid directory name collision with /api
 */
const { handler } = require("../../api/_core.js");

exports.handler = async (event, context) => {
  return handler(event, context);
};
