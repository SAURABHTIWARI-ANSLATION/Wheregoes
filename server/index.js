const functions = require('firebase-functions');
const app = require('./server');

// This wraps your Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
