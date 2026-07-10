import { Sen } from 'next/font/google';
import './globals.css';

const sen = Sen({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sen',
});

export const metadata = {
  title: 'Yo-bot — AI support chat platform',
  description: 'Create an AI support chatbot for any website in minutes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sen.variable}>
      <body>{children}</body>
    </html>
  );
}
