"use client";

import { Inter } from "next/font/google";

import dynamic from "next/dynamic";

const ReduxProvider = dynamic(() => import("@/store/redux-provider"), {
  ssr: false
});

import "react-toastify/dist/ReactToastify.css";

import "@/styles/global.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <title>Light Board</title>
      <body>
          <ReduxProvider>
            {children}
          </ReduxProvider>
      </body>
    </html>
  );
}