import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Pink Chess · Dein nächster Lieblingszug',description:'Schach in Pink. Mit Freunden per Einladungslink, gegen Ben oder zu zweit an einem Gerät.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
