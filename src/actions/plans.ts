"use server";
import supabase from "@/config/supabase-config";

export const addNewPlan = async (payload: any) => {
  try {
    console.log("📝 Adding new plan to Supabase with payload:", payload);
    console.log("🖼️ Images being saved:", payload.images);
    
    const { data, error } = await supabase.from("plans").insert(payload);
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("✅ Plan added successfully to Supabase");
    console.log("🔗 Image URLs saved to database:", payload.images);
    
    return {
      success: true,
      message: "Plan added Successfully",
    };
  } catch (error: any) {
    console.error("❌ Error adding plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllPlans = async () => {
  try {
    console.log("🔄 Fetching all plans from Supabase...");
    
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`📋 Retrieved ${data?.length || 0} plans from Supabase`);
    
    // Debug log for image URLs
    if (data && data.length > 0) {
      data.forEach((plan, index) => {
        console.log(`Plan ${index + 1}: ${plan.name}`);
        if (plan.images && plan.images.length > 0) {
          plan.images.forEach((imageUrl: string, imgIndex: number) => {
            console.log(`  🖼️ Image ${imgIndex + 1}: ${imageUrl}`);
            if (imageUrl.includes('pub-ef28cea76db19c5ab98885b745bb0e57.r2.dev')) {
              console.log(`    ✅ Correct Cloudflare R2 public URL format`);
            } else if (imageUrl.includes('.r2.dev')) {
              console.log(`    ⚠️ Different R2 account ID detected`);
            } else {
              console.log(`    ❌ Not a Cloudflare R2 URL - check upload process`);
            }
          });
        } else {
          console.log(`    ❌ No images found for plan: ${plan.name}`);
        }
      });
    }
    
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ Error fetching plans:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const editPlanById = async (id: string, payload: any) => {
  try {
    console.log(`📝 Updating plan ${id} with payload:`, payload);
    console.log("🖼️ Updated images:", payload.images);
    
    const { data, error } = await supabase
      .from("plans")
      .update(payload)
      .match({ id });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("✅ Plan updated successfully");
    console.log("🔗 Updated image URLs in database:", payload.images);
    
    return {
      success: true,
      message: "Plan Updated successfully",
    };
  } catch (error: any) {
    console.error("❌ Error updating plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getPlanById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`📋 Retrieved plan ${id}:`, data?.[0]);
    
    return {
      success: true,
      data: data?.[0],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deletePlanById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("plans").delete().match({ id });
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("✅ Plan deleted successfully");
    
    return {
      success: true,
      message: "Plan deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
