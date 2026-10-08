const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgres://postgres:Kr71645225%23%2A@db.fwpltoembnslmiipuxlx.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      -- 1. BRIDAL PARTY
      CREATE TABLE IF NOT EXISTS bridal_party (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          contact_number TEXT,
          measurements JSONB DEFAULT '{}'::jsonb,
          tasks TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE bridal_party ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Couples can manage bridal party" ON bridal_party FOR ALL USING (workspace_id = public.get_user_workspace() AND public.get_user_role() = 'COUPLE');

      -- 2. SEATING PLAN (Tables)
      CREATE TABLE IF NOT EXISTS seating_tables (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          table_name TEXT NOT NULL,
          capacity INTEGER DEFAULT 10,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Couples can manage seating tables" ON seating_tables FOR ALL USING (workspace_id = public.get_user_workspace() AND public.get_user_role() = 'COUPLE');

      -- Add table_id to guests
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guests' AND column_name='table_id') THEN
          ALTER TABLE guests ADD COLUMN table_id UUID REFERENCES seating_tables(id) ON DELETE SET NULL;
        END IF;
      END $$;

      -- 3. MUSIC PLAYLIST
      CREATE TABLE IF NOT EXISTS music_playlist (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          moment TEXT NOT NULL,
          link TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE music_playlist ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Couples can manage music" ON music_playlist FOR ALL USING (workspace_id = public.get_user_workspace() AND public.get_user_role() = 'COUPLE');
    `;
    
    await client.query(sql);
    console.log('Update SQL executed successfully!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

run();
