import './globals.css';

export const metadata = {
  title: 'Yo-bot — AI support chat platform',
  description: 'Create an AI support chatbot for any website in minutes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
