"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  PlusCircle, 
  ImagePlus, 
  Cloud, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Loader2,
  X 
} from "lucide-react";
import toast from "react-hot-toast";
import { uplaodFileAndGetUrl } from "@/utils";
import { addNewPlan, editPlanById } from "@/actions/plans";
import { useRouter } from "next/navigation";
import { validateCloudflareR2Setup } from "@/utils/cloudflare-r2";

interface PlanFormProps {
  formType?: "add" | "edit";
  initialValues?: any;
}

function PlanForm({ formType, initialValues }: PlanFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [testMode, setTestMode] = useState<boolean>(false);
  const router = useRouter();
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<any[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(
    initialValues?.images || []
  );

  useEffect(() => {
    console.log("Initial images loaded:", initialValues?.images);
  }, [initialValues]);

  const formSchema = z.object({
    name: z.string().nonempty("Name is required"),
    description: z.string().nonempty("Description is required"),
    features: z.array(z.string()).nonempty("Features is required"),
    monthly_price: z.number(),
    quarterly_price: z.number(),
    half_yearly_price: z.number(),
    yearly_price: z.number(),
  });

  const form: any = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      features: initialValues?.features || [],
      monthly_price: initialValues?.monthly_price || 0,
      quarterly_price: initialValues?.quarterly_price || 0,
      half_yearly_price: initialValues?.half_yearly_price || 0,
      yearly_price: initialValues?.yearly_price || 0,
    },
  });

  // Enhanced R2 setup test with SSL diagnostics
  const testCloudflareR2Setup = async () => {
    try {
      console.log("🔍 Testing Cloudflare R2 setup and SSL connection...");
      toast.loading("Testing R2 connection...", { id: "r2-test" });
      
      const response = await validateCloudflareR2Setup();
      
      toast.dismiss("r2-test");
      
      if (response.success) {
        toast.success("✅ Cloudflare R2 connection successful!", {
          duration: 3000,
        });
        console.log("✅ R2 test passed:", response.message);
      } else {
        toast.error(`❌ R2 Connection Failed: ${response.message}`, {
          duration: 5000,
        });
        console.error("❌ R2 test failed:", response.message);
        
        // Show SSL-specific guidance
        if (response.message.includes("SSL") || response.message.includes("handshake")) {
          toast.error("🔒 SSL Issue detected. Check your endpoint configuration.", {
            duration: 7000,
          });
        }
      }
    } catch (error: any) {
      toast.dismiss("r2-test");
      console.error("R2 test error:", error);
      toast.error(`❌ Test failed: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  const handleCancel = async () => {
    try {
      setCancelLoading(true);
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push("/account/admin/plans");
    } catch (error) {
      toast.error("Failed to navigate back");
    } finally {
      setCancelLoading(false);
    }
  };

  async function onSubmit(values: any) {
    try {
      setLoading(true);
      console.log("=== PLAN FORM SUBMISSION STARTED ===");
      
      let newMediaUrls = [];
      for (let file of selectedMediaFiles) {
        console.log(`📤 Uploading: ${file.name} (${file.size} bytes, ${file.type})`);
        
        toast.loading(`Uploading ${file.name}...`, { id: `upload-${file.name}` });
        
        const response = await uplaodFileAndGetUrl(file);
        
        toast.dismiss(`upload-${file.name}`);
        
        if (!response.success) {
          // Enhanced error handling for SSL issues
          if (response.message.includes("SSL") || response.message.includes("handshake") || response.message.includes("EPROTO")) {
            toast.error(`🔒 SSL Error: ${response.message}`, { duration: 7000 });
            toast.error("💡 Try testing R2 connection first", { duration: 5000 });
          } else {
            toast.error(`❌ Upload failed: ${response.message}`, { duration: 5000 });
          }
          throw new Error(response.message);
        } else {
          console.log("✅ File uploaded successfully:", response.data);
          newMediaUrls.push(response.data);
          toast.success(`✅ ${file.name} uploaded successfully!`);
        }
      }

      // Combine existing and new image URLs
      values.images = [...existingMediaUrls, ...newMediaUrls];
      console.log("=== FINAL URLs BEING SAVED TO SUPABASE ===");
      console.log("All image URLs:", values.images);

      // Save to database
      let response = null;
      if (formType === "add") {
        console.log("Creating new plan...");
        response = await addNewPlan(values);
      } else {
        console.log("Updating existing plan...");
        response = await editPlanById(initialValues.id, values);
      }

      if (response.success) {
        toast.success(`✅ ${response.message}`, {
          duration: 3000,
        });
        router.push("/account/admin/plans");
      } else {
        toast.error(`❌ ${response.message}`, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("❌ Form submission error:", error);
      
      // Show specific guidance for SSL errors
      if (error.message.includes("SSL") || error.message.includes("handshake") || error.message.includes("EPROTO")) {
        toast.error("🔒 SSL connection failed. Check your R2 configuration.", {
          duration: 7000,
        });
      } else {
        toast.error(`❌ ${error.message || "Something went wrong"}`, {
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const pricingFields = [
    "monthly_price",
    "quarterly_price",
    "half_yearly_price",
    "yearly_price",
  ];

  const onSelectedMediaFilesRemove = (index: number) => {
    const temp = [...selectedMediaFiles];
    temp.splice(index, 1);
    setSelectedMediaFiles(temp);
  };

  const onExistingMediaUrlsRemove = (index: number) => {
    const temp = [...existingMediaUrls];
    temp.splice(index, 1);
    setExistingMediaUrls(temp);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mt-7">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {formType === "add" ? "Create New Plan" : "Edit Plan"}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Test Mode Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTestMode(!testMode)}
            className={`flex items-center gap-2 transition-colors ${
              testMode 
                ? "bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100" 
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings size={14} />
            Test Mode
            {testMode && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
          </Button>

          {/* Enhanced R2 Test Button - Only show in test mode */}
          {testMode && (
            <Button
              type="button"
              variant="outline"
              onClick={testCloudflareR2Setup}
              className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Cloud size={16} />
              Test R2 & SSL
            </Button>
          )}
        </div>
      </div>

      {/* SSL Warning Banner - Only show in test mode */}
      {testMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg relative">
          <button
            onClick={() => setTestMode(false)}
            className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">SSL Configuration Notice</span>
          </div>
          <p className="text-sm text-yellow-700 pr-6">
            If you encounter SSL handshake errors, ensure your R2 endpoint matches your account ID. 
            Use the "Test R2 & SSL" button to verify your connection.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Plan Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="input-container focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter plan name"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-container min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter plan description"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Features Section */}
          <fieldset className="p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
            <legend className="px-2 text-sm font-medium text-gray-700 bg-white">
              Plan Features
            </legend>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  name={`features.${index}`}
                  key={field.id}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <div className="flex-1 relative">
                          <Input
                            className="input-container pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter feature"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => remove(index)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-4 flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              onClick={() => append("")}
            >
              <PlusCircle size={16} />
              <span>Add Feature</span>
            </Button>
          </fieldset>

          {/* Pricing Section */}
          <fieldset className="p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
            <legend className="px-2 text-sm font-medium text-gray-700 bg-white">
              Pricing Options
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingFields.map((item) => (
                <FormField
                  control={form.control}
                  name={item}
                  key={item}
                  render={({ field }) => (
                    <FormItem className="bg-white p-4 rounded-md shadow-sm">
                      <FormLabel className="text-xs font-semibold text-gray-600 uppercase">
                        {item.replace("_", " ").replace("_", " ")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="input-container pl-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : parseFloat(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </fieldset>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FormLabel className="text-sm font-medium text-gray-700">
                Plan Images
              </FormLabel>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <Cloud size={12} />
                <span>Cloudflare R2 • SSL Secured</span>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
              <ImagePlus size={40} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">Upload plan images to Cloudflare R2</p>
              <p className="text-xs text-gray-400 mb-4">Secure SSL connection • Unlimited egress</p>
              <Input
                className="max-w-xs mx-auto"
                type="file"
                multiple
                accept="image/*"
                onChange={(e: any) => {
                  if (e.target.files && e.target.files.length > 0) {
                    console.log("Files selected for upload:", Array.from(e.target.files));
                    setSelectedMediaFiles([
                      ...selectedMediaFiles,
                      ...Array.from(e.target.files),
                    ]);
                  }
                }}
              />
            </div>

            {/* Image Preview Section */}
            <div className="mt-4">
              {(existingMediaUrls.length > 0 || selectedMediaFiles.length > 0) && (
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Images ({existingMediaUrls.length + selectedMediaFiles.length})
                </h4>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingMediaUrls.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative group border border-gray-200 rounded-md p-2 bg-white"
                  >
                    <img
                      src={url}
                      className="w-full h-24 object-contain"
                      alt={`Existing Preview ${index}`}
                      onLoad={() => {
                        console.log("✅ Image loaded successfully:", url);
                      }}
                      onError={(e) => {
                        console.error("❌ Image load error:", url);
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='0.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      onClick={() => onExistingMediaUrlsRemove(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="text-xs text-blue-600 truncate mt-1 flex items-center gap-1">
                      <CheckCircle size={10} />
                      R2 Stored
                    </p>
                  </div>
                ))}
                {selectedMediaFiles.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group border border-gray-200 rounded-md p-2 bg-white"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-24 object-contain"
                      alt={`New Preview ${index}`}
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      onClick={() => onSelectedMediaFilesRemove(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[100px]"
              onClick={handleCancel}
              disabled={cancelLoading || loading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel"
              )}
            </Button>
            <Button
              disabled={loading || cancelLoading}
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Cloud size={16} />
                  {formType === "add" ? "Create Plan" : "Update Plan"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default PlanForm;
