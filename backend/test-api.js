const http = require('http');

function req(options, body) {
  return new Promise((resolve) => {
    const r = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // 1. Login
  const loginBody = JSON.stringify({ phone: '+998901234567', password: 'test123' });
  const login = await req({
    hostname: 'localhost', port: 5000,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
  }, loginBody);

  console.log('LOGIN:', login.status, login.body.slice(0, 300));

  let token = '';
  try {
    const parsed = JSON.parse(login.body);
    token = parsed.data?.accessToken || parsed.data?.tokens?.accessToken || '';
  } catch(e) {}

  if (!token) {
    console.log('No token, trying register...');
    const regBody = JSON.stringify({
      phone: '+998901234567', password: 'test123',
      fullName: 'Test Admin', centerName: 'Test Markaz'
    });
    const reg = await req({
      hostname: 'localhost', port: 5000,
      path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regBody) }
    }, regBody);
    console.log('REGISTER:', reg.status, reg.body.slice(0, 300));
    try {
      const parsed = JSON.parse(reg.body);
      token = parsed.data?.accessToken || parsed.data?.tokens?.accessToken || '';
    } catch(e) {}
  }

  if (!token) { console.log('CANNOT GET TOKEN'); return; }
  console.log('\nTOKEN:', token.slice(0, 50) + '...');

  // 2. Dashboard stats
  const stats = await req({
    hostname: 'localhost', port: 5000,
    path: '/api/dashboard/stats', method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
  console.log('\nDASHBOARD STATS:', stats.status, stats.body.slice(0, 200));

  // 3. Create group
  const groupBody = JSON.stringify({
    name: 'Test Guruh',
    subject: 'Frontend',
    level: 'Boshlang\'ich',
    schedule: JSON.stringify({ monday: { enabled: true, startTime: '09:00', endTime: '11:00' } }),
    maxStudents: 20
  });
  const group = await req({
    hostname: 'localhost', port: 5000,
    path: '/api/groups', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(groupBody),
      Authorization: 'Bearer ' + token
    }
  }, groupBody);
  console.log('\nCREATE GROUP:', group.status, group.body.slice(0, 300));
}

main().catch(console.error);
