import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: "Low-Poly Tree and Plant Generator",
  description: "An interactive 3D procedural generator to customize, preview, and export low-poly 3D plant and tree models as Three.js/React-Three-Fiber code structures.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
