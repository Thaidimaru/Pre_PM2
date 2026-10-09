/**
 * Netlify Function adapter delegating directly to api/_core.js
 */
const { handler } = require("../../api/_core.js");

exports.handler = async (event, context) => {
  return handler(event, context);
};
