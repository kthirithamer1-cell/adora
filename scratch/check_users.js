const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  let url = 'https://ucgslhophamzwqbkkayu.supabase.co';
  let key = '';

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      key = trimmed.split('=')[1].trim();
    } else if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      url = trimmed.split('=')[1].trim();
    }
  }

  console.log('Fetching users from Supabase Cloud...');
  const usersRes = await fetch(`${url}/rest/v1/users?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  const users = await usersRes.json();
  console.log('--- USERS IN SUPABASE ---');
  console.log(JSON.stringify(users, null, 2));

  console.log('Fetching workspaces from Supabase Cloud...');
  const wsRes = await fetch(`${url}/rest/v1/workspaces?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  const workspaces = await wsRes.json();
  console.log('--- WORKSPACES IN SUPABASE ---');
  console.log(JSON.stringify(workspaces, null, 2));
}

main().catch(console.error);
