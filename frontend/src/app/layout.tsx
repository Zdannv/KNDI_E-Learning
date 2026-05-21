import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KNDI E-Learning Platform",
  description: "Internal e-learning platform for Japanese language training at PT Kyodo News Digital Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <AuthProvider>
          <RoleProvider>{children}</RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}