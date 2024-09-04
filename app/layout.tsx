import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: "normal",
  display: "swap",
  variable: "--noto-text",
});

const notoKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: "normal",
  display: "swap",
  variable: "--notoKR-text",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 바나마켓",
    default: "바나마켓",
  },
  description: "싸고 품질 좋은 농산물 직거래 플랫폼",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${noto.variable} ${notoKR.variable} mx-auto max-w-screen-sm`}
      >
        {children}
      </body>
    </html>
  );
}
