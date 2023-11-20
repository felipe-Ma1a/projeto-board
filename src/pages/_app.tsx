import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Header } from "@/components/header";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
