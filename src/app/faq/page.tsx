"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, Sparkles, ShieldCheck, Mail, MessageCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    {
      name: "Privacy & Security",
      questions: [
        {
          q: "Is PicPop really anonymous?",
          a: "Yes. Our platform uses a one-way anonymity engine. When you send feedback, your identity is never revealed to the recipient. We do not expose IP addresses, geographic locations, or account details of the sender. The only way someone will know who you are is if you explicitly state your name in your feedback message."
        },
        {
          q: "How do you handle data encryption?",
          a: "Every piece of data that moves through PicPop is encrypted in transit using TLS 1.3 and at rest using AES-256. This means even in the unlikely event of a data intercept, the information remains unreadable. We prioritize cryptographic integrity across our entire database architecture."
        },
        {
          q: "Do you sell my data to third parties?",
          a: "No. We have a strict 'No-Sale' data policy. Your feedback, images, and session data are your own. We generate revenue through non-intrusive advertisements (like Google AdSense) and premium features, not by commoditizing your personal information."
        }
      ]
    },
    {
      name: "Using the Platform",
      questions: [
        {
          q: "How do I create a feedback link?",
          a: "Simply sign in using your Google, Facebook, or Yahoo account. Once you've claimed your unique 'Cool ID', your personal portal link is automatically generated. You can find it on your dashboard, ready to be shared on your social media bios."
        },
        {
          q: "Can I delete feedback I've received?",
          a: "Yes. You have total agency over your inbox. If you receive feedback that is inappropriate or that you simply don't want to keep, you can delete it permanently. This action removes the data from our active production database immediately."
        },
        {
          q: "What image formats are supported?",
          a: "We support all major web-image formats including JPG, PNG, WEBP, and HEIC. We automatically optimize and compress images on upload to ensure fast loading times while maintaining high visual fidelity."
        }
      ]
    },
    {
      name: "Safety & Community",
      questions: [
        {
          q: "What measures are in place to prevent bullying?",
          a: "Safety is our priority. We use AI-driven content moderation to scan for explicit or toxic content. Additionally, every user has the power to block specific senders and report accounts to our human moderation team, which operates 24/7."
        },
        {
          q: "Can I turn off my link temporarily?",
          a: "While we don't have a 'pause' button yet, you can simply remove the link from your social bios. We are working on a 'Maintenance Mode' feature that will allow you to temporarily disable incoming drops without deleting your account."
        }
      ]
    }
  ];

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden"
      style={{ fontFamily: "'Nunito', var(--font-nunito), sans-serif" }}
    >
      {/* Background Glows */}
      <div className="fixed top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[var(--purple)]/5 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-[var(--pink)]/5 blur-[120px] rounded-full z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 active:scale-95">
             <img src="/logo.svg" alt="picpop" className="h-8 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> exit
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <HelpCircle className="w-4 h-4 text-[var(--blue)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Knowledge Base</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
            How can we <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--blue)] via-[var(--purple)] to-[var(--pink)]">help you?</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] font-bold max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about PicPop's anonymity, security, and community guidelines. Can't find an answer? Reach out to us.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-20 mb-32">
          {categories.map((cat, catIdx) => (
            <div key={catIdx}>
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-8 ml-4">{cat.name}</h2>
               <div className="space-y-4">
                  {cat.questions.map((item, qIdx) => {
                    const globalIdx = catIdx * 10 + qIdx;
                    const isOpen = openIndex === globalIdx;
                    return (
                      <div 
                        key={qIdx} 
                        className={`rounded-[2.5rem] border transition-all duration-300 ${isOpen ? 'bg-white/[0.04] border-white/10' : 'bg-white/[0.02] border-white/05 hover:bg-white/[0.03]'}`}
                      >
                        <button 
                          onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                          className="w-full px-8 py-7 flex items-center justify-between text-left"
                        >
                          <span className="text-lg font-black text-white">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                             <p className="text-[var(--text-muted)] font-bold leading-relaxed text-sm max-w-2xl italic">
                               {item.a}
                             </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="p-12 sm:p-20 rounded-[4rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-32 h-32" /></div>
           <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Still have questions?</h2>
           <p className="text-[var(--text-muted)] font-bold mb-10 max-w-md mx-auto">Our team of support specialists and privacy experts are ready to assist you around the clock.</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:support@picpop.me" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black hover:scale-105 transition-all">
                 <Mail className="w-4 h-4" /> Support Desk
              </a>
              <Link href="/contact" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all">
                 <MessageCircle className="w-4 h-4" /> Contact Us
              </Link>
           </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
