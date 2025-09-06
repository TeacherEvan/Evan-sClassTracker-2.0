import './globals.css'

export const metadata = {
  title: "Evan's Class Tracker 2.0",
  description: 'A way for teachers and school moderators to keep track of teachers classes and credits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        {children}
      </body>
    </html>
  )
}