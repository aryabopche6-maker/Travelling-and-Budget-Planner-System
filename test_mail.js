const https = require('https');

const postData = JSON.stringify({
  to: 'aryabopche6@gmail.com',
  subject: 'Test WanderPlan Email',
  htmlBody: '<h1>Hello! Email system working!</h1>'
});

const url = 'https://script.google.com/macros/s/AKfycbzbdetoLJJuC_RZuG6dEbswjYvcSBz8MRDXCbrSQbI26Tu3c6CGpRQ3XrSQP4-a-DaM/exec';

function send(targetUrl, method) {
  const parsed = new URL(targetUrl);
  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log('Redirecting to:', res.headers.location);
      // Google Script redirects to a GET url on script.googleusercontent.com
      https.get(res.headers.location, (redirectRes) => {
        let body = '';
        redirectRes.on('data', chunk => body += chunk);
        redirectRes.on('end', () => console.log('Response after redirect:', body));
      });
      return;
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Response:', body));
  });

  req.on('error', (e) => console.error('Error:', e));
  req.write(postData);
  req.end();
}

send(url, 'POST');
