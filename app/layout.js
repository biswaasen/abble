import './globals.css';

const title = 'Abble 1';
const description = 'Abble 1. The interface for personal computing. Launching in 2027 at $149. Join the waitlist.';

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
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
