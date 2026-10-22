import { Bai_Jamjuree, IBM_Plex_Sans_Thai, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display voice — a geometric, engineered Thai/Latin face for headings.
const display = Bai_Jamjuree({
  subsets: ['latin', 'thai'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--ff-display',
});

// Body voice — calm, highly legible in both scripts.
const sans = IBM_Plex_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--ff-sans',
});

// Console voice — stage labels, indices, code.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--ff-mono',
});

export const metadata = {
  title: 'Yo-bot — แชทซัพพอร์ต AI สำหรับทุกเว็บไซต์',
  description: 'สร้างบอทซัพพอร์ต AI ที่ตอบจากความรู้ของคุณ แล้วติดตั้งบนเว็บไซต์ด้วยสคริปต์บรรทัดเดียว',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
