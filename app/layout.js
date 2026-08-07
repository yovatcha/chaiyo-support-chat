import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Lumen Sans is proprietary; Inter is the documented open-source substitute —
// same geometric proportions, run at modest weights (400 body / 500 display).
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
});

// The system's only second voice — mono for the embed / code captions.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata = {
  title: 'Yo-bot — AI support chat platform',
  description: 'Create an AI support chatbot for any website in minutes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
