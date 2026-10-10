import './globals.css';
import Link from 'next/link';

export const metadata={title:'Courskills — Learn. Practice. Grow.',description:'A practical skills learning platform with an integrated Forex Academy.'};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><header className="topbar"><div className="container topbar-inner"><Link className="logo" href="/">Course<span>skills</span></Link><nav className="nav"><Link href="/programmes">Programmes</Link><Link href="/dashboard">Student portal</Link><Link href="/login">Sign in</Link></nav></div></header>{children}</body></html>
}
