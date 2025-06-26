import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId } = await req.json();
    if (!requestId) throw new Error('Request ID is required.');

    // 1. Fetch the change request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('change_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error(requestError?.message || 'Change request not found.');
    }

    if (request.status !== 'pending') {
      throw new Error('This request has already been processed.');
    }

    const { user_id, field, requested_value } = request;

    // 2. Update auth table if necessary (e.g., for email)
    if (field === 'email') {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { email: requested_value }
      );
      if (authError) throw new Error(`Auth update failed: ${authError.message}`);
    }
    
    // If you add mobile number changes, you would handle it here too.
    // if (field === 'mobile_number') { ... }

    // 3. Determine if user is a worker or general user and update the correct table
    const { data: worker } = await supabaseAdmin
      .from('workers')
      .select('id')
      .eq('user_id', user_id)
      .single();
      
    const targetTable = worker ? 'workers' : 'profiles';
    const idColumn = worker ? 'user_id' : 'id';
    
    // In the workers table, some column names might be different (e.g., 'full_name' vs 'name')
    // This maps the generic 'field' from the request to the correct column name in the target table.
    const columnMapping: { [key: string]: string } = {
        name: 'full_name', // `profiles` and `workers` both use `full_name`
        email: 'email',
        mobile: 'mobile_number', // `profiles` has 'mobile', `workers` has 'mobile_number'
        location_address: 'location_address',
        service_category: 'service_category',
        service_subcategories: 'service_subcategories'
    };
    
    const targetColumn = columnMapping[field] || field;

    // If updating service_category, validate the value exists in service_categories
    if (targetColumn === 'service_category') {
      const { data: validCat } = await supabaseAdmin
        .from('service_categories')
        .select('category_id')
        .eq('category_id', requested_value)
        .single();
      if (!validCat) {
        throw new Error('Requested category_id does not exist in service_categories.');
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from(targetTable)
      .update({ [targetColumn]: requested_value })
      .eq(idColumn, user_id);

    if (updateError) {
      throw new Error(`Failed to update ${targetTable}: ${updateError.message}`);
    }

    // 4. Mark request as approved
    const { error: statusError } = await supabaseAdmin
      .from('change_requests')
      .update({ status: 'approved', admin_response: 'Approved and applied.' })
      .eq('id', requestId);

    if (statusError) {
      // The main change was applied, but the status update failed. Log this.
      console.error(`CRITICAL: Change for request ${requestId} was applied, but status update failed:`, statusError.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 