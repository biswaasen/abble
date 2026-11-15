import '@fontsource-variable/google-sans-flex';
import './globals.css';

const title = 'abble. Your agents. Within reach.';
const description = 'A tiny glass screen for your AI coding agents. One clear decision. A little more freedom to step away.';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://abble.si'),
  title,
  description,
  openGraph: { title, description, images: [{ url: '/og.jpg', width: 1200, height: 630 }], type: 'website' },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
};

export const viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
