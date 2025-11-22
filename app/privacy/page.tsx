import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy | World Sports Academy',
    description: 'Privacy Policy for World Sports Academy',
}

export default function PrivacyPolicyPage() {
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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[#50C878]/10 rounded-lg">
                                <Shield className="w-8 h-8 text-[#50C878]" />
                            </div>
                            <div>
                                <CardTitle className="text-4xl font-bold text-white">Privacy Policy</CardTitle>
                                <p className="text-gray-400 mt-2">Last updated: November 21, 2025</p>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            World Sports Academy is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </p>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="w-6 h-6 text-[#50C878]" />
                                <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
                            </div>

                            <div className="text-gray-300 leading-relaxed space-y-4">
                                <h3 className="text-xl font-semibold text-white mt-4">1.1 Personal Information</h3>
                                <p>We collect information that you provide directly to us, including:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                                    <li><strong className="text-white">Account Information:</strong> Name, email address, phone number, date of birth</li>
                                    <li><strong className="text-white">Payment Information:</strong> Credit card details, billing address (processed securely through Stripe)</li>
                                    <li><strong className="text-white">Profile Data:</strong> Profile picture, preferences, emergency contact information</li>
                                    <li><strong className="text-white">Booking Information:</strong> Reservation details, sport preferences, facility usage history</li>
                                    <li><strong className="text-white">Communications:</strong> Messages, feedback, and customer support inquiries</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white mt-6">1.2 Automatically Collected Information</h3>
                                <p>When you access our services, we automatically collect:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                                    <li><strong className="text-white">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                                    <li><strong className="text-white">Usage Data:</strong> Pages viewed, links clicked, time spent on pages, search queries</li>
                                    <li><strong className="text-white">Location Data:</strong> General geographic location based on IP address</li>
                                    <li><strong className="text-white">Cookies and Tracking:</strong> Session data, preferences, authentication tokens</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white mt-6">1.3 Third-Party Authentication</h3>
                                <p>
                                    If you sign in using Google or other third-party services, we receive basic profile information (name, email, profile picture) as authorized by you through that service.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="w-6 h-6 text-[#50C878]" />
                                <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
                            </div>

                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide, maintain, and improve our services</li>
                                    <li>Process bookings, memberships, and payments</li>
                                    <li>Send booking confirmations, receipts, and account notifications</li>
                                    <li>Respond to your inquiries and provide customer support</li>
                                    <li>Personalize your experience and provide tailored recommendations</li>
                                    <li>Monitor and analyze usage patterns and trends</li>
                                    <li>Detect, prevent, and address technical issues and fraud</li>
                                    <li>Comply with legal obligations and enforce our terms</li>
                                    <li>Send marketing communications (with your consent)</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-[#50C878]" />
                                <h2 className="text-2xl font-bold text-white">3. Information Sharing and Disclosure</h2>
                            </div>

                            <div className="text-gray-300 leading-relaxed space-y-4">
                                <p>We may share your information in the following circumstances:</p>

                                <h3 className="text-xl font-semibold text-white mt-4">3.1 Service Providers</h3>
                                <p>
                                    We share information with third-party service providers who perform services on our behalf, including:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong className="text-white">Payment Processing:</strong> Stripe (for secure payment processing)</li>
                                    <li><strong className="text-white">Email Services:</strong> Resend (for transactional emails)</li>
                                    <li><strong className="text-white">Database Hosting:</strong> Supabase (for secure data storage)</li>
                                    <li><strong className="text-white">Authentication:</strong> Google OAuth (for social login)</li>
                                    <li><strong className="text-white">Analytics:</strong> Usage analytics providers</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white mt-6">3.2 Legal Requirements</h3>
                                <p>
                                    We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, subpoenas, law enforcement).
                                </p>

                                <h3 className="text-xl font-semibold text-white mt-6">3.3 Business Transfers</h3>
                                <p>
                                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                                </p>

                                <h3 className="text-xl font-semibold text-white mt-6">3.4 With Your Consent</h3>
                                <p>
                                    We may share your information for other purposes with your explicit consent.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-[#50C878]" />
                                <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
                            </div>

                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>
                                    We implement appropriate technical and organizational security measures to protect your information, including:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Regular security assessments and updates</li>
                                    <li>Access controls and authentication requirements</li>
                                    <li>Secure payment processing through PCI-compliant providers</li>
                                    <li>Regular backups and disaster recovery procedures</li>
                                </ul>
                                <p className="mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                                    <strong className="text-amber-400">Important:</strong> While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Bell className="w-6 h-6 text-[#50C878]" />
                                <h2 className="text-2xl font-bold text-white">5. Your Rights and Choices</h2>
                            </div>

                            <div className="text-gray-300 leading-relaxed space-y-4">
                                <p>You have the following rights regarding your personal information:</p>

                                <h3 className="text-xl font-semibold text-white mt-4">5.1 Access and Portability</h3>
                                <p>You can access and download your personal information through your account dashboard.</p>

                                <h3 className="text-xl font-semibold text-white mt-4">5.2 Correction</h3>
                                <p>You can update your account information at any time through your profile settings.</p>

                                <h3 className="text-xl font-semibold text-white mt-4">5.3 Deletion</h3>
                                <p>You can request deletion of your account and associated data by contacting us. Some information may be retained as required by law or for legitimate business purposes.</p>

                                <h3 className="text-xl font-semibold text-white mt-4">5.4 Marketing Communications</h3>
                                <p>You can opt out of marketing emails by clicking the "unsubscribe" link in any marketing email or updating your communication preferences in your account.</p>

                                <h3 className="text-xl font-semibold text-white mt-4">5.5 Cookies</h3>
                                <p>You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
                            <div className="text-gray-300 leading-relaxed space-y-3">
                                <p>We retain your information for as long as necessary to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide our services and fulfill transactions</li>
                                    <li>Comply with legal obligations (e.g., tax, accounting requirements)</li>
                                    <li>Resolve disputes and enforce agreements</li>
                                    <li>Maintain business records and analytics</li>
                                </ul>
                                <p className="mt-4">
                                    When information is no longer needed, we securely delete or anonymize it.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to request deletion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Privacy Policy</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our website. The "Last updated" date at the top of this policy indicates when it was last revised.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                            <div className="text-gray-300 leading-relaxed">
                                <p className="mb-4">If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                                <div className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-800">
                                    <p className="text-lg"><strong className="text-white">World Sports Academy</strong></p>
                                    <p className="mt-2">Burlington, Ontario, Canada</p>
                                    <p className="mt-2">Email: <a href="mailto:privacy@worldsportsacademy.com" className="text-[#50C878] hover:text-[#CFEA6C] font-semibold">privacy@worldsportsacademy.com</a></p>
                                    <p className="mt-4 text-sm text-gray-400">
                                        For data protection inquiries, please include "Privacy Request" in your email subject line.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <div className="flex items-start gap-3 p-4 bg-[#50C878]/5 border border-[#50C878]/20 rounded-lg">
                                <Shield className="w-5 h-5 text-[#50C878] mt-1 flex-shrink-0" />
                                <p className="text-gray-300 text-sm">
                                    <strong className="text-white">Your Privacy Matters:</strong> We are committed to transparency and protecting your personal information. By using our services, you acknowledge that you have read and understood this Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
