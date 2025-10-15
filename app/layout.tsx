export const metadata = {
  title: "EncryptedSoul.art – Encrypt your thoughts into art",
  description: "Turn your words into encrypted art. Powered by Zama. Created by @OxAnuj."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-display grad">{children}</body>
    </html>
  );
}
