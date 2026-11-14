import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Pink Chess · Dein nächster Lieblingszug',description:'Schach in Pink. Mit Freunden per Einladungslink, gegen Ben oder zu zweit an einem Gerät.',manifest:'/manifest.webmanifest',applicationName:'Pink Chess',appleWebApp:{capable:true,statusBarStyle:'default',title:'Pink Chess'},icons:{icon:'/icons/pink-chess-32.png',apple:'/icons/pink-chess-180.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#d42b79'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
