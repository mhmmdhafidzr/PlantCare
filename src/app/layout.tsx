import './globals.css'
import { Red_Hat_Text } from 'next/font/google'

const font = Red_Hat_Text({ subsets: ['latin'] })

export const metadata = {
  title: 'PlantCare | Leaf Disease Detection'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-[#75c913] ${font.className}`}>
        {children}
      </body>
    </html>
  )
}
