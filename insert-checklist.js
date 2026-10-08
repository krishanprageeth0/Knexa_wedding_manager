const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgres://postgres:Kr71645225%23%2A@db.fwpltoembnslmiipuxlx.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    
    // Get all workspace IDs
    const wsRes = await client.query('SELECT id FROM workspaces');
    
    const tasks = [
      "Book Wedding Venue / Hotel",
      "Finalize Guest List",
      "Hire Photographer & Videographer",
      "Book Bridal Dressing / Makeup Artist",
      "Order Bridal Saree / Dress & Second Day Outfit",
      "Order Groom's Suit / Kandyan Nilame Kit",
      "Book Poruwa Decorator / Florist",
      "Hire Traditional Dancers & Drummers",
      "Book Wedding Band / DJ",
      "Order Wedding Cake & Cake Structures",
      "Design and Print Wedding Invitations",
      "Arrange Wedding Cars / Transport",
      "Buy Wedding Rings",
      "Apply for Marriage Registration (Notice of Marriage)",
      "Plan Honeymoon & Book Tickets/Hotels"
    ];

    for (const row of wsRes.rows) {
      const workspaceId = row.id;
      for (const title of tasks) {
        // Only insert if it doesn't already exist to avoid duplicates
        await client.query(
          `INSERT INTO checklists (workspace_id, title) 
           SELECT $1, $2 
           WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE workspace_id = $1 AND title = $2)`,
          [workspaceId, title]
        );
      }
    }
    
    console.log('Default Sri Lankan wedding checklist inserted successfully!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

run();
