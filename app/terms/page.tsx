import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'Terms of Service | World Sports Academy',
    description: 'Terms of Service for World Sports Academy',
}

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[#50C878] hover:text-[#CFEA6C] transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-800">
                        <CardTitle className="text-4xl font-bold text-white">Terms of Service</CardTitle>
                        <p className="text-gray-400 mt-2">Last updated: November 21, 2025</p>
                    </CardHeader>

                    <CardContent className="prose prose-invert max-w-none p-8 space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-300 leading-relaxed">
                                By accessing and using the World Sports Academy website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p className="text-gray-300 leading-relaxed">
                                World Sports Academy provides sports facility booking services, membership programs, and online account management. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>When you create an account with us, you agree to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide accurate, current, and complete information</li>
                                    <li>Maintain the security of your password and account</li>
                                    <li>Accept all responsibility for activities that occur under your account</li>
                                    <li>Notify us immediately of any unauthorized use of your account</li>
                                </ul>
                                <p className="mt-4">
                                    We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Bookings and Reservations</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <h3 className="text-xl font-semibold text-white mt-4">4.1 Booking Confirmation</h3>
                                <p>
                                    All bookings are subject to availability and confirmation. Payment must be received in full at the time of booking unless otherwise specified.
                                </p>

                                <h3 className="text-xl font-semibold text-white mt-4">4.2 Cancellation Policy</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Cancellations made 24 hours or more before the scheduled time receive a full refund</li>
                                    <li>Cancellations made within 24 hours are subject to a 50% cancellation fee</li>
                                    <li>No-shows forfeit the entire booking fee</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white mt-4">4.3 Late Arrivals</h3>
                                <p>
                                    Late arrivals may result in reduced facility time. Bookings will not be extended beyond the reserved end time, and no refunds will be issued for time lost due to late arrival.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Memberships</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>Membership terms vary by plan. All memberships include:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Monthly recurring billing unless otherwise specified</li>
                                    <li>30-day notice required for cancellation</li>
                                    <li>Non-transferable membership privileges</li>
                                    <li>Subject to facility rules and availability</li>
                                </ul>
                                <p className="mt-4">
                                    We reserve the right to modify membership benefits and pricing with 30 days&apos; advance notice to active members.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Payment Terms</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>
                                    All payments are processed securely through Stripe. By providing payment information, you authorize us to charge the applicable fees to your payment method.
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-3">
                                    <li>All prices are in Canadian Dollars (CAD) unless otherwise stated</li>
                                    <li>Prices are subject to applicable taxes</li>
                                    <li>Failed payments may result in service suspension</li>
                                    <li>Chargebacks may result in account termination</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Assumption of Risk and Waiver</h2>
                            <p className="text-gray-300 leading-relaxed">
                                By using our facilities, you acknowledge that participation in sports and physical activities involves inherent risks. You agree to the terms of our Release of Liability, Waiver of Claims, and Assumption of Risks agreement, which is presented during account registration.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Facility Rules</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>All users must comply with facility rules, including but not limited to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Appropriate athletic attire and footwear required</li>
                                    <li>Respectful behavior toward staff and other users</li>
                                    <li>No outside food or beverages (water bottles permitted)</li>
                                    <li>Equipment must be returned in good condition</li>
                                    <li>Smoking, vaping, and alcohol prohibited on premises</li>
                                </ul>
                                <p className="mt-4">
                                    Violation of facility rules may result in removal from the premises and/or account termination without refund.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Intellectual Property</h2>
                            <p className="text-gray-300 leading-relaxed">
                                All content, trademarks, logos, and intellectual property on this website are owned by World Sports Academy or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
                            <p className="text-gray-300 leading-relaxed">
                                To the maximum extent permitted by law, World Sports Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services, even if we have been advised of the possibility of such damages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
                            <p className="text-gray-300 leading-relaxed">
                                You agree to indemnify and hold harmless World Sports Academy, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services or violation of these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
                            <p className="text-gray-300 leading-relaxed">
                                These terms shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through prominent notice on our website. Continued use of our services after such modifications constitutes acceptance of the updated terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
                            <div className="text-gray-300 leading-relaxed">
                                <p>If you have any questions about these Terms of Service, please contact us:</p>
                                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                    <p><strong className="text-white">World Sports Academy</strong></p>
                                    <p>Burlington, Ontario, Canada</p>
                                    <p>Email: <a href="mailto:info@worldsportsacademy.com" className="text-[#50C878] hover:text-[#CFEA6C]">info@worldsportsacademy.com</a></p>
                                </div>
                            </div>
                        </section>

                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <p className="text-gray-500 text-sm text-center">
                                By using World Sports Academy services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
