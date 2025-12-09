import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function SellPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-primary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Sell Your Land Faster in Abuja
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        Join the #1 marketplace for verified land sales. Connect directly with serious buyers and close deals with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="text-primary font-bold text-lg px-8" asChild>
                            <Link href="/agent/dashboard">Start Selling for Free</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                            <Link href="#pricing">View Pricing Plans</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why List With Us?</h2>
                        <p className="text-gray-600">We provide the tools and visibility you need to succeed.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Targeted Audience</h3>
                            <p className="text-gray-600">
                                Our platform attracts high-net-worth individuals and serious investors looking specifically for land in Abuja.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Verified Agent Badge</h3>
                            <p className="text-gray-600">
                                Build trust instantly. Verified agents get a badge that signals credibility to potential buyers.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
                            <p className="text-gray-600">
                                Track views, clicks, and leads from your dashboard. Understand what buyers are looking for.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 bg-white border-t">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-600">Choose the plan that fits your business needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <h3 className="text-2xl font-bold mb-2">Starter</h3>
                            <div className="text-4xl font-bold mb-6">Free</div>
                            <p className="text-gray-600 mb-6">Perfect for individual owners or new agents.</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>1 Active Listing</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Basic Support</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Standard Visibility</span>
                                </li>
                            </ul>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/agent/dashboard">Get Started</Link>
                            </Button>
                        </div>

                        {/* Premium Plan */}
                        <div className="border-2 border-primary rounded-2xl p-8 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                                RECOMMENDED
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pro Agent</h3>
                            <div className="text-4xl font-bold mb-6">₦15,000<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <p className="text-gray-600 mb-6">For serious agents who want to close more deals.</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span>Unlimited Listings</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span>"Verified Agent" Badge</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span>Featured Listings Rotation</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span>Advanced Analytics</span>
                                </li>
                            </ul>
                            <Button className="w-full" asChild>
                                <Link href="/agent/dashboard">Go Premium</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to Sell?</h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Create your account in minutes and start listing your properties.
                    </p>
                    <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-bold px-8" asChild>
                        <Link href="/agent/dashboard">Create Agent Account</Link>
                    </Button>
                </div>
            </section>
        </main>
    );
}
