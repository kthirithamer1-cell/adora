const url = 'https://ucgslhophamzwqbkkayu.supabase.co';
const key = 'sb_publishable_mybt4bPcZ3KxyPcyESG74A_VThSpBkU';

const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
});

console.log(res.status);
const spec = await res.json();
console.log(Object.keys(spec.paths || spec));