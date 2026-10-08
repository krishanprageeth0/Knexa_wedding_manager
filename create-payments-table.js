const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgres://postgres:Kr71645225%23%2A@db.fwpltoembnslmiipuxlx.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          vendor TEXT NOT NULL,
          type TEXT NOT NULL,
          amount NUMERIC(12, 2) DEFAULT 0.00,
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Couples can manage payments" ON payments FOR ALL USING (workspace_id = public.get_user_workspace() AND public.get_user_role() = 'COUPLE');
    `;
    
    await client.query(sql);
    console.log('Payments table created successfully!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

run();
