const url = 'https://ucgslhophamzwqbkkayu.supabase.co';
const key = 'sb_publishable_mybt4bPcZ3KxyPcyESG74A_VThSpBkU';

// 1. sign in
const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'kthirithamer1@gmail.com', password: 'Gtapmpthamer4@' }),
});
const loginData = await login.json();
console.log('LOGIN:', login.status, loginData);
const access_token = loginData.access_token;


// 2. query as that user
const res = await fetch(`${url}/rest/v1/YOUR_TABLE?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${access_token}` },
});
console.log(res.status, JSON.stringify(await res.json(), null, 2));