import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReduceInventoryRequest {
  product_id: string;
  quantity: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user making the request
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    const { product_id, quantity }: ReduceInventoryRequest = await req.json();

    if (!product_id || !quantity) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get product type
    const { data: productData, error: productError } = await supabase
      .from("menu_items")
      .select("product_type")
      .eq("id", product_id)
      .single();

    if (productError) {
      return new Response(
        JSON.stringify({ error: `Error fetching product: ${productError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const productType = productData?.product_type || "individual";

    // Get recipe data
    const { data: recipeData, error: recipeError } = await supabase
      .from("recetas")
      .select("inventory_item_id, quantity")
      .eq("menu_item_id", product_id);

    if (recipeError) {
      // If no recipe data, try to get from menu_item_ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("menu_item_ingredients")
        .select("inventory_item_id")
        .eq("menu_item_id", product_id);

      if (ingredientsError) {
        return new Response(
          JSON.stringify({ error: `Error fetching ingredients: ${ingredientsError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // If we have ingredients data but no recipe data, use default quantity of 1
      if (ingredientsData && ingredientsData.length > 0) {
        const results = [];
        
        for (const ingredient of ingredientsData) {
          // Get current inventory item
          const { data: inventoryItem, error: inventoryError } = await supabase
            .from("inventory_items")
            .select("stock_actual, quantity")
            .eq("id", ingredient.inventory_item_id)
            .single();

          if (inventoryError) {
            console.error("Error fetching inventory item:", inventoryError);
            continue;
          }

          // Calculate new stock
          const currentStock = inventoryItem.stock_actual !== null ? 
            inventoryItem.stock_actual : inventoryItem.quantity;
          
          // For individual products, reduce by 1 unit per quantity
          const reductionPerUnit = 1;
          const totalReduction = reductionPerUnit * quantity;
          const newStock = Math.max(0, currentStock - totalReduction);

          // Update inventory
          const { error: updateError } = await supabase
            .from("inventory_items")
            .update({ stock_actual: newStock })
            .eq("id", ingredient.inventory_item_id);

          if (updateError) {
            console.error("Error updating inventory:", updateError);
          } else {
            results.push({
              inventory_item_id: ingredient.inventory_item_id,
              previous_stock: currentStock,
              new_stock: newStock
            });
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Inventory updated using default quantities",
            results
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "No recipe or ingredients found for this product" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Process recipe data
    const results = [];
    
    for (const recipe of recipeData) {
      // Get current inventory item
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from("inventory_items")
        .select("stock_actual, quantity")
        .eq("id", recipe.inventory_item_id)
        .single();

      if (inventoryError) {
        console.error("Error fetching inventory item:", inventoryError);
        continue;
      }

      // Calculate new stock
      const currentStock = inventoryItem.stock_actual !== null ? 
        inventoryItem.stock_actual : inventoryItem.quantity;
      
      const totalReduction = recipe.quantity * quantity;
      const newStock = Math.max(0, currentStock - totalReduction);

      // Update inventory
      const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ stock_actual: newStock })
        .eq("id", recipe.inventory_item_id);

      if (updateError) {
        console.error("Error updating inventory:", updateError);
      } else {
        results.push({
          inventory_item_id: recipe.inventory_item_id,
          previous_stock: currentStock,
          new_stock: newStock,
          reduction: totalReduction
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        product_type: productType,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});