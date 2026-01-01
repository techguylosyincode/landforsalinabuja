import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-primary text-white py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
                <div>
                    <h3 className="font-bold text-xl mb-4">LandForSaleInAbuja.ng</h3>
                    <p className="text-gray-300 text-sm">
                        The definitive marketplace for verified land sales in Abuja. Secure your plot today.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/buy" className="hover:text-secondary">Buy Land</Link></li>
                        <li><Link href="/sell" className="hover:text-secondary">Sell Land</Link></li>
                        <li><Link href="/blog" className="hover:text-secondary">Area Guides</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Popular Areas</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/buy/maitama" className="hover:text-secondary">Land in Maitama</Link></li>
                        <li><Link href="/buy/asokoro" className="hover:text-secondary">Land in Asokoro</Link></li>
                        <li><Link href="/buy/guzape" className="hover:text-secondary">Land in Guzape</Link></li>
                        <li><Link href="/buy/wuse-ii" className="hover:text-secondary">Land in Wuse II</Link></li>
                        <li><Link href="/buy/gwarinpa" className="hover:text-secondary">Land in Gwarinpa</Link></li>
                        <li><Link href="/buy/lugbe" className="hover:text-secondary">Land in Lugbe</Link></li>
                        <li><Link href="/buy/katampe" className="hover:text-secondary">Land in Katampe</Link></li>
                        <li><Link href="/buy/idu" className="hover:text-secondary">Land in Idu</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>support@landforsaleinabuja.ng</li>
                        <li>+234 800 000 0000</li>
                        <li>Abuja, FCT, Nigeria</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/privacy" className="hover:text-secondary">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-secondary">Terms of Service</Link></li>
                        <li><Link href="/cookies" className="hover:text-secondary">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} LandForSaleInAbuja.ng. All rights reserved.
            </div>
        </footer>
    );
}
