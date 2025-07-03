"use server";
import { uploadFileToCloudflareR2 } from "./cloudflare-r2";

export const uplaodFileAndGetUrl = async (file: File) => {
  try {
    console.log("📤 Starting Cloudflare R2 upload with SSL fix...");
    console.log(`📁 File details: ${file.name} (${file.size} bytes, ${file.type})`);
    
    // Add file validation
    if (!file) {
      throw new Error("No file selected");
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error("File size exceeds 100MB limit");
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Please upload an image file.");
    }
    
    console.log("✅ File validation passed, proceeding with SSL-fixed Cloudflare R2 upload...");
    
    // ✅ FIXED: Use SSL-fixed Cloudflare R2 upload
    const uploadResult = await uploadFileToCloudflareR2(file);
    
    if (!uploadResult.success || !uploadResult.data) {
      console.error("❌ Cloudflare R2 upload failed:", uploadResult.message);
      throw new Error(uploadResult.message || "Upload failed - no data returned");
    }
    
    console.log("🎯 Upload successful! Public URL will be saved to Supabase:");
    console.log(`  📍 Public URL: ${uploadResult.data.publicUrl}`);
    console.log(`  🆔 File ID: ${uploadResult.data.fileId}`);
    
    // Verify URL format with CORRECT account ID
    const expectedPublicAccountId = "b405618cfd954e148a28cc9d3dd6ef41";
    if (!uploadResult.data.publicUrl.includes(`pub-${expectedPublicAccountId}.r2.dev`)) {
      console.warn("⚠️ URL format may not be publicly accessible");
      console.warn(`Expected format: https://pub-${expectedPublicAccountId}.r2.dev/...`);
      console.warn("Actual URL:", uploadResult.data.publicUrl);
    } else {
      console.log("✅ Correct account ID detected in URL - SSL handshake successful");
    }
    
    return {
      success: true,
      data: uploadResult.data.publicUrl, // This URL gets saved to Supabase plans table
      fileId: uploadResult.data.fileId,
    };
  } catch (error: any) {
    console.error("❌ Upload error details:", error);
    
    // Enhanced error reporting for SSL issues
    if (error.message.includes("SSL") || error.message.includes("handshake") || error.message.includes("EPROTO")) {
      console.error("🔒 SSL handshake failed despite fixes");
      console.error("💡 Solution: Verify account ID matches your actual R2 bucket");
    } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
      console.error("🔒 Public access issue detected");
      console.error("💡 Solution: Enable Public Development URL in your R2 bucket settings");
    }
    
    return {
      success: false,
      message: error.message || "Upload failed",
    };
  }
};
