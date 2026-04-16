"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Trash2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <style>{`
        .privacy-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-6 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        <div className="privacy-card p-8 sm:p-12 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
              <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest mt-1 opacity-60">Updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-10">
            <p className="text-lg text-white/70 leading-relaxed font-bold">
              At PicPop, we prioritize your privacy while enabling social interaction. This policy outlines how we handle your data across our platform.
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">01</span>
                Information We Collect
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-black">
                    <Lock className="w-4 h-4 text-purple-400" /> Account Data
                  </div>
                  <p className="text-sm text-white/40 font-bold">We store your CoolId, display name, and authentication details via secure Firebase sessions.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-black">
                    <Eye className="w-4 h-4 text-pink-400" /> Usage Logs
                  </div>
                  <p className="text-sm text-white/40 font-bold">Anonymous device data, IP addresses (for security), and activity logs help us improve service quality.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">02</span>
                Cookies & Advertising
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                PicPop uses cookies to enhance your experience. We also use <strong>Google AdSense</strong> to serve advertisements. Google, as a third-party vendor, uses cookies (including the <strong>DoubleClick cookie</strong>) to serve ads based on your visit to PicPop and other sites on the Internet. 
              </p>
              <p className="text-white/50 leading-relaxed font-bold">
                You can opt-out of the use of the DoubleClick cookie for interest-based advertising by visiting <a href="https://adssettings.google.com" className="text-blue-400 underline">Google Ads Settings</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">03</span>
                How We Use Data
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                Your data is used solely to operate the platform, manage notifications, prevent harassment, and analyze global usage trends via <strong>Google Analytics</strong> and <strong>Microsoft Clarity</strong>. We never use your images for AI training or external advertising.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">04</span>
                Sharing & Disclosure
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                We do <strong>not</strong> sell your data. Information is shared with service providers (Firebase and Google Cloud) only as necessary to host the application. We may disclose data if required by legal mandates or to protect users from imminent harm.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">05</span>
                Data Retention & Security
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                We retain your personal data only as long as necessary to provide our services and fulfill the transactions you have requested. We implement industry-standard security measures, including SSL encryption and secure data storage, to protect your information from unauthorized access or disclosure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">06</span>
                Children's Privacy
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                PicPop is not intended for children under 13. We do not knowingly collect personal data from children. If you are a parent and believe your child has provided us with information, please contact us for immediate removal.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">07</span>
                External Links
              </h2>
              <p className="text-white/50 leading-relaxed font-bold">
                Our website may contain links to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
              </p>
            </section>

            <section className="space-y-4 p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10">
              <h2 className="text-xl font-black text-red-400 flex items-center gap-3">
                <Trash2 className="w-6 h-6" /> Data Deletion & Rights
              </h2>
              <p className="text-red-100/60 leading-relaxed font-bold">
                You have the right to access, correct, or delete your data. You can request account deletion at any time via the settings menu. Upon deletion, your profile data and uploaded images are permanently removed from our active production database. Under certain jurisdictions like GDPR or CCPA, you may have additional rights regarding data portability and transparency.
              </p>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black italic">
              Questions? Contact us through <a href="mailto:privacy@picpop.me" className="text-white/60 underline">privacy@picpop.me</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
