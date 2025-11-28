import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TubeGenius - AI YouTube Thumbnail & Title Generator",
  description: "Generate AI-powered YouTube titles and customizable thumbnails with drag-and-drop text overlays",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
