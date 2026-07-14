const http = require('http');
function req(opt, body) {
  return new Promise(resolve => {
    const r = http.request(opt, res => {
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
  // Login - find existing user
  const phones = ['+998901234567', '+998901234568', '+998911234567'];
  let token = '';
  
  for (const phone of phones) {
    const b = JSON.stringify({ phone, password: 'test123' });
    const res = await req({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, b);
    console.log('TRY LOGIN', phone, res.status);
    try {
      const p = JSON.parse(res.body);
      token = p.data?.accessToken || p.data?.tokens?.accessToken || '';
      if (token) { console.log('GOT TOKEN!'); break; }
    } catch(e) {}
  }

  if (!token) {
    console.log('No token. Creating test user...');
    const b = JSON.stringify({ phone: '+998901234567', password: 'test123', fullName: 'Test Admin', centerName: 'Test Markaz' });
    const res = await req({
      hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) }
    }, b);
    console.log('REGISTER:', res.status, res.body.slice(0, 200));
    try {
      const p = JSON.parse(res.body);
      token = p.data?.accessToken || p.data?.tokens?.accessToken || '';
    } catch(e) {}
  }

  if (!token) { console.log('STILL NO TOKEN'); return; }

  // Test create group WITHOUT teacherId
  const gb = JSON.stringify({
    name: 'Test Guruh 2025',
    subject: 'Frontend',
    level: "Boshlang'ich",
    schedule: JSON.stringify({ monday: { enabled: true, startTime: '09:00', endTime: '11:00' } }),
    maxStudents: 20,
    courseFee: 0
  });
  const gr = await req({
    hostname: 'localhost', port: 5000, path: '/api/groups', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(gb), Authorization: 'Bearer ' + token }
  }, gb);
  console.log('\nCREATE GROUP:', gr.status, gr.body.slice(0, 300));

  // Test dashboard stats
  const ds = await req({
    hostname: 'localhost', port: 5000, path: '/api/dashboard/stats', method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
  console.log('\nDASHBOARD:', ds.status, ds.body.slice(0, 200));
}

main().catch(console.error);
