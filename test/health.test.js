const http = require('http');

http.get('http://localhost:5000/health', (res) => {
  console.log('STATUS:', res.statusCode);
}).on('error', (err) => {
  console.error('Error:', err.message);
});