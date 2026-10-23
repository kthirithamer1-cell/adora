const SUPABASE_URL = 'https://ucgslhophamzwqbkkayu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3NsaG9waGFtendxYmtrYXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTQ1MDksImV4cCI6MjEwNzI5MDUwOX0.FLAGfbDzyMnIbOESR3O0E6CJip9AfvGBNswq0d11OkM';

async function queryTable(table, query = '') {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('--- SUPABASE USERS ---');
  const usersRes = await queryTable('users');
  console.log('Users:', JSON.stringify(usersRes, null, 2));

  console.log('--- SUPABASE WORKSPACES ---');
  const wsRes = await queryTable('workspaces');
  console.log('Workspaces:', JSON.stringify(wsRes, null, 2));

  console.log('--- SUPABASE CREDIT LEDGER ---');
  const ledgerRes = await queryTable('credit_ledger');
  console.log('Credit Ledger:', JSON.stringify(ledgerRes, null, 2));

  console.log('--- SUPABASE CREDIT TRANSACTIONS ---');
  const txRes = await queryTable('credit_transactions');
  console.log('Transactions:', JSON.stringify(txRes, null, 2));
}

main();
