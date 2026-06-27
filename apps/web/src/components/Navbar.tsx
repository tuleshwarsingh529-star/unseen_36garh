"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LogOut, Menu, X, UserCircle, Globe, ChevronDown,
  ShieldAlert, Settings, MoreHorizontal,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth-store";
import { useLanguage } from "../context/LanguageContext";

// Primary links always visible on desktop
const PRIMARY_LINKS = [
  { href: "/explore",  key: "nav.map"      },
  { href: "/planner",  key: "nav.plan_trip" },
  { href: "/stories",  key: "nav.stories"  },
];

// Secondary links hidden in "More" dropdown on desktop, shown in mobile drawer
const SECONDARY_LINKS = [
  { href: "/creators",  key: "nav.creators" },
  { href: "/creator",   key: "nav.creator"  },
  { href: "/bookmarks", key: "nav.saved"    },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [langOpen,   setLangOpen]     = useState(false);
  const [moreOpen,   setMoreOpen]     = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const { lang, changeLanguage, t, accessibilityMode, toggleAccessibilityMode } = useLanguage();

  // Shadow on scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className={`sticky top-0 z-50 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 transition-shadow duration-200 ${scrolled ? "shadow-md dark:shadow-zinc-900/50" : "shadow-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center gap-4">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 mr-2">
            <Image
              src="/logo.jpg"
              alt="Unseen_36garh"
              width={32} height={32}
              className="rounded-lg object-cover border border-forest-emerald/20 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-[15px] text-forest-emerald dark:text-emerald-400 group-hover:text-tribal-terracotta dark:group-hover:text-warm-orange transition-colors whitespace-nowrap">
              Unseen_36garh
            </span>
          </Link>

          {/* ── Desktop primary nav ── (hidden below md) */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {PRIMARY_LINKS.map(({ href, key }) => (
              <Link
                key={href} href={href}
                className="text-[13px] font-semibold text-charcoal-stone/75 dark:text-zinc-300 hover:text-forest-emerald dark:hover:text-emerald-400 hover:bg-forest-emerald/5 dark:hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                {t(key)}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="text-[13px] font-semibold text-charcoal-stone/60 dark:text-zinc-400 hover:text-forest-emerald dark:hover:text-emerald-400 hover:bg-forest-emerald/5 dark:hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden lg:inline">More</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1 z-50">
                  {SECONDARY_LINKS.map(({ href, key }) => (
                    <Link
                      key={href} href={href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2.5 text-[13px] font-semibold text-charcoal-stone/75 dark:text-zinc-300 hover:bg-forest-emerald/5 dark:hover:bg-emerald-500/10 hover:text-forest-emerald dark:hover:text-emerald-400 transition-colors"
                    >
                      {t(key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* SOS */}
            <Link
              href="/sos"
              className="text-[13px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ml-1"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500 animate-pulse shrink-0" />
              {t("nav.sos")}
            </Link>
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 ml-auto shrink-0">

            {/* Language picker */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="h-8 px-2.5 flex items-center gap-1 rounded-lg border border-forest-emerald/20 dark:border-emerald-500/20 bg-forest-emerald/5 dark:bg-emerald-500/10 hover:bg-forest-emerald/10 dark:hover:bg-emerald-500/20 text-forest-emerald dark:text-emerald-400 text-[12px] font-bold cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono uppercase">{lang === "cg" ? "CG" : lang.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1 z-50">
                  {[
                    { code: "en", label: "English" },
                    { code: "hi", label: "हिन्दी" },
                    { code: "cg", label: "छत्तीसगढ़ी" },
                  ].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { changeLanguage(code as "en" | "hi" | "cg"); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold flex items-center justify-between cursor-pointer transition-colors ${lang === code ? "text-forest-emerald dark:text-emerald-400 bg-forest-emerald/5 dark:bg-emerald-500/10" : "text-charcoal-stone/70 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                    >
                      {label}
                      {lang === code && <span className="w-1.5 h-1.5 rounded-full bg-forest-emerald dark:bg-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility toggle — icon only */}
            <button
              onClick={toggleAccessibilityMode}
              title={accessibilityMode ? "Disable Easy-Read" : "Enable Easy-Read"}
              className={`h-8 w-8 hidden sm:flex items-center justify-center rounded-lg border text-sm cursor-pointer transition-all ${accessibilityMode ? "bg-tribal-terracotta border-tribal-terracotta text-white" : "border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"}`}
            >
              👁️
            </button>

            {/* Auth */}
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-forest-emerald/20 dark:border-emerald-500/30 bg-forest-emerald/5 dark:bg-emerald-500/10">
                  <UserCircle className="w-3.5 h-3.5 text-forest-emerald dark:text-emerald-400 shrink-0" />
                  <span className="text-[12px] font-bold text-forest-emerald dark:text-emerald-400">{user.fullName.split(" ")[0]}</span>
                  <span className="text-[9px] font-mono font-black uppercase text-tribal-terracotta">{user.role}</span>
                </div>
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <Link href="/admin" className="hidden lg:inline-flex items-center gap-1 h-8 px-3 text-[12px] font-bold rounded-lg border border-forest-emerald/30 text-forest-emerald hover:bg-forest-emerald hover:text-white transition-all">
                    <Settings className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-charcoal-stone/40 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex h-8 items-center px-3 text-[13px] font-semibold text-charcoal-stone/70 dark:text-zinc-300 hover:text-forest-emerald dark:hover:text-emerald-400 rounded-lg hover:bg-forest-emerald/5 dark:hover:bg-emerald-500/10 transition-all whitespace-nowrap">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="hidden sm:inline-flex h-8 items-center px-4 text-[13px] font-bold bg-forest-emerald hover:bg-tribal-terracotta text-white rounded-lg shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap">
                  {t("nav.signup")}
                </Link>
              </>
            )}

            {/* Hamburger — below md */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4 text-forest-emerald dark:text-emerald-400" /> : <Menu className="w-4 h-4 text-forest-emerald dark:text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-14 z-40 bg-charcoal-stone/20 dark:bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-14 left-0 right-0 z-50 md:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-2xl max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1 p-3">

              {/* Language row */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-1">
                <div className="flex gap-1">
                  {[{ code: "en", label: "EN" }, { code: "hi", label: "हिन्दी" }, { code: "cg", label: "CG" }].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code as "en" | "hi" | "cg")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${lang === code ? "bg-forest-emerald dark:bg-emerald-600 text-white shadow-sm" : "text-charcoal-stone/60 dark:text-zinc-400 hover:text-forest-emerald dark:hover:text-emerald-400"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={toggleAccessibilityMode}
                  className={`h-8 px-3 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${accessibilityMode ? "bg-tribal-terracotta border-tribal-terracotta text-white" : "border-gray-200 dark:border-zinc-700 text-charcoal-stone/60 dark:text-zinc-400"}`}
                >
                  👁️ {accessibilityMode ? "Standard" : "Easy"}
                </button>
              </div>

              {/* User row */}
              {user && (
                <div className="flex items-center justify-between p-3 bg-forest-emerald/5 dark:bg-emerald-500/10 rounded-xl border border-forest-emerald/10 dark:border-emerald-500/20 mb-1">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-forest-emerald dark:text-emerald-400" />
                    <span className="text-[12px] font-bold text-forest-emerald dark:text-emerald-400">{user.fullName}</span>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] font-bold cursor-pointer">
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
              )}

              {/* All links */}
              {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map(({ href, key }) => (
                <Link
                  key={href} href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-[14px] font-semibold text-charcoal-stone/80 dark:text-zinc-300 hover:bg-forest-emerald/5 dark:hover:bg-emerald-500/10 hover:text-forest-emerald dark:hover:text-emerald-400 transition-all"
                >
                  {t(key)}
                </Link>
              ))}

              <Link href="/sos" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {t("nav.sos")}
              </Link>

              {!user && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="h-10 rounded-xl flex items-center justify-center text-[13px] font-bold border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-charcoal-stone/75 dark:text-zinc-300">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="h-10 rounded-xl flex items-center justify-center text-[13px] font-bold bg-forest-emerald text-white hover:bg-tribal-terracotta transition-all shadow-sm">
                    {t("nav.signup")}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
