const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fwpltoembnslmiipuxlx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cGx0b2VtYm5zbG1paXB1eGx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTI2MzE0NywiZXhwIjoyMTA2ODM5MTQ3fQ.wN6ig8q-XW1Wv8flVhNBuk3TEfdgJSRlHlO-3zQfDho'
);

async function createAdmin() {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@knexa.com',
    password: 'AdminPassword123!',
    email_confirm: true
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    return;
  }

  const { error: dbError } = await supabase.from('users').insert([{
    id: authData.user.id,
    role: 'SUPER_ADMIN',
    full_name: 'Super Admin'
  }]);

  if (dbError) {
    console.error('Error inserting into users:', dbError.message);
  } else {
    console.log('Admin user created successfully!');
  }
}

createAdmin();
