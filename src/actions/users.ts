"use server";

import supabase from "@/config/supabase-config";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export const getCurrentUserFromSupabase = async () => {
  try {
    // if the clerk user is present in the supabase database, then return the user , else create a new user and return the user
    const clerkUser = await currentUser();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("clerk_user_id", clerkUser?.id);

    if (error) {
      throw error;
    }
    if (data && data.length) {
      return {
        success: true,
        data: data[0],
      };
    }

    // create a new user in the supabase database
    const newUserObj = {
      clerk_user_id: clerkUser?.id,
      email: clerkUser?.emailAddresses[0].emailAddress,
      name: clerkUser?.firstName + " " + clerkUser?.lastName,
      is_active: true,
      is_admin: false,
    };

    const { data: newUser, error: newUserError } = await supabase
      .from("user_profiles")
      .insert([newUserObj])
      .select("*");
    if (newUserError) {
      throw newUserError;
    }

    return {
      success: true,
      data: newUser[0],
    };

    throw new Error("User not found");
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*");
    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("is_customer", true);
    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteUserById = async (userId: string) => {
  try {
    console.log("Starting user deletion process for userId:", userId);

    // First, get the user's clerk_user_id
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('clerk_user_id, name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw new Error('User not found in database');
    }

    console.log("Found user data:", userData);

    // Delete user's subscriptions first
    console.log("Deleting user subscriptions...");
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError);
      // Continue with user deletion even if subscriptions deletion fails
    } else {
      console.log("Successfully deleted user subscriptions");
    }

    // Delete user from Clerk FIRST (before Supabase)
    if (userData.clerk_user_id) {
      try {
        console.log("Deleting user from Clerk with ID:", userData.clerk_user_id);
        
        // Fixed: Use clerkClient as a function that returns a Promise
        const clerk = await clerkClient();
        await clerk.users.deleteUser(userData.clerk_user_id);
        
        console.log("Successfully deleted user from Clerk");
      } catch (clerkError: any) {
        console.error('Error deleting user from Clerk:', clerkError);
        
        // If Clerk deletion fails, don't proceed with Supabase deletion
        // This ensures data consistency
        throw new Error(`Failed to delete user from Clerk: ${clerkError.message}`);
      }
    } else {
      console.log("No Clerk user ID found, skipping Clerk deletion");
    }

    // Only delete from Supabase if Clerk deletion was successful
    console.log("Deleting user from Supabase...");
    const { error: supabaseError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (supabaseError) {
      console.error('Error deleting user from Supabase:', supabaseError);
      throw new Error('Failed to delete user from database');
    }

    console.log("Successfully deleted user from Supabase");

    return {
      success: true,
      message: "User and all associated data deleted successfully from both Clerk and Supabase"
    };
  } catch (error: any) {
    console.error("Delete user error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete user"
    };
  }
};

export const getUserSubscriptionCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      count: count || 0
    };
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      message: error.message
    };
  }
};
