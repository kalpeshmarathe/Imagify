"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, Zap, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useToast } from "@/lib/toast-context";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate a successful submission
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Message sent! We'll get back to you within 24-48 hours.");
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info Side */}
          <div className="space-y-12 py-4">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink)] via-[var(--purple)] to-[var(--blue)]">Talk.</span>
              </h1>
              <p className="text-lg text-[var(--text-muted)] font-bold marker:leading-relaxed">
                Feedback, feature requests, or questions about privacy? We're here to help you get the most out of PicPop.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-[1.5rem] bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/10 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-xs mb-1">Email Us</h3>
                  <p className="text-white/80 font-bold mb-1">support@picpop.me</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Support / General Inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-xs mb-1">Privacy Officer</h3>
                  <p className="text-white/80 font-bold mb-1">privacy@picpop.me</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Data & Compliance / Legal</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-xs mb-1">Abuse Reporting</h3>
                  <p className="text-white/80 font-bold mb-1">report@picpop.me</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Safety / Community Guidelines</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-white uppercase tracking-widest text-xs opacity-30">Our Roots</h4>
              <p className="text-[var(--text-muted)] text-sm font-bold">
                PicPop Studio <br />
                Mumbai, Maharashtra <br />
                India
              </p>
            </div>


            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-[var(--blue)]" />
                    <h4 className="font-black text-white text-sm">Response Time</h4>
                 </div>
                 <p className="text-[var(--text-muted)] text-sm font-bold">Most queries are addressed within <span className="text-white">24 hours</span> on business days.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-1 sm:p-4 rounded-[3.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden">
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">Your Name</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">Message</label>
                    <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Tell us what's on your mind..."
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-white/10 resize-none"
                    />
                </div>

                <button 
                    disabled={submitting}
                    className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                    {submitting ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send className="w-4 h-4" /> Send Message
                        </>
                    )}
                </button>
             </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
