/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    // try to insert an invalid record to get the exact schema constraints or error
    const { error } = await supabase.from('monthly_records').insert({
        promoter_id: '550e8400-e29b-41d4-a716-446655440000', // random uuid
        year: 2024,
        month: 1,
        days: 0,
        payment_completed: false,
        payment_status: "pending"
    });
    console.log(error);
}
check();
