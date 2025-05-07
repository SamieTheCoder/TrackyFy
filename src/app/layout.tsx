import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import CustomLayout from "@/custom-layout";
import { Toaster} from "react-hot-toast";



export const metadata: Metadata = {
  title: "TrackyFy",
  description: "Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CustomLayout>{children}</CustomLayout>

          <Toaster position="top-center" reverseOrder={false} />
        </body>
      </html>
    </ClerkProvider>
  );
}
