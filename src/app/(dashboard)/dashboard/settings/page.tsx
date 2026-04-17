/* eslint-disable @next/next/no-img-element */
"use client";

import { mockUser } from "@/lib/mock";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both">
      <div className="mt-4">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Manage your account settings, team preferences, and API security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Settings Navigation Sidebar */}
        <div className="flex overflow-x-auto lg:w-64 lg:flex-col gap-2 shrink-0 pb-4 lg:pb-0 hide-scrollbar lg:sticky lg:top-28 lg:h-fit">
          <button className="text-sm font-bold text-left px-5 py-3 rounded-2xl bg-accent text-foreground border border-border/50 shadow-[0_4px_16px_rgba(37,99,235,0.08)] whitespace-nowrap transition-all">General</button>
          <button className="text-sm font-semibold text-left px-5 py-3 rounded-2xl text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-all whitespace-nowrap">Billing</button>
          <button className="text-sm font-semibold text-left px-5 py-3 rounded-2xl text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-all whitespace-nowrap">Team Members</button>
          <button className="text-sm font-semibold text-left px-5 py-3 rounded-2xl text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-all whitespace-nowrap">Access Security</button>
          <button className="text-sm font-semibold text-left px-5 py-3 rounded-2xl text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-all whitespace-nowrap">API Tokens</button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-10">
          {/* Section: Profile */}
          <div className="rounded-[40px] border border-border bg-card/40 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-[150px] bg-blue-600/5 blur-[80px] -z-10 rounded-full" />
            <div className="p-10 relative z-10">
              <div className="mb-10">
                <h3 className="text-lg font-bold text-foreground">Profile Overview</h3>
                <p className="text-sm text-muted-foreground mt-1.5 opacity-60">Manage how your identifiers appear across the Multivrs network.</p>
              </div>
              
              <div className="flex items-center gap-8 mb-10">
                 <div className="relative group">
                   <div className="h-28 w-28 rounded-[32px] overflow-hidden border-2 border-border shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                     <img src={mockUser.avatar} alt={mockUser.name} className="h-full w-full object-cover grayscale-[0.2] transition-all duration-500 group-hover:grayscale-0" />
                   </div>
                   <div className="absolute inset-0 rounded-[32px] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <button className="rounded-2xl bg-foreground text-background px-6 py-3 text-sm font-bold hover:bg-foreground/90 transition-all shadow-xl active:scale-95">Update Photo</button>
                   <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-[0.1em]">Recommended: 400x400 JPG/PNG</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Account Display Name</label>
                  <input type="text" defaultValue={mockUser.name} className="w-full rounded-2xl border border-border bg-muted/20 px-5 py-4 text-sm font-medium text-foreground focus:border-blue-500/80 focus:bg-muted/40 focus:outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Primary Email Node</label>
                  <input type="email" defaultValue={mockUser.email} className="w-full rounded-2xl border border-border bg-muted/20 px-5 py-4 text-sm font-medium text-foreground focus:border-blue-500/80 focus:bg-muted/40 focus:outline-none transition-all shadow-inner" />
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-muted/20 px-10 py-6 flex justify-end relative z-10">
              <button className="rounded-2xl bg-foreground text-background px-8 py-3.5 text-sm font-black hover:bg-foreground/90 transition-all shadow-lg active:scale-95">Deploy Profile Changes</button>
            </div>
          </div>

          {/* Section: Danger Zone */}
          <div className="rounded-[40px] border border-destructive/20 bg-card/40 backdrop-blur-3xl overflow-hidden relative shadow-2xl group">
             <div className="absolute top-0 left-0 w-full h-[150px] bg-destructive/5 blur-[80px] -z-10 rounded-full transition-all group-hover:bg-destructive/10" />
            <div className="p-10 relative z-10">
              <h3 className="text-lg font-bold text-foreground">Archive Account</h3>
              <p className="text-sm text-muted-foreground mt-1.5 opacity-60">Permanently disconnect your identity and all associated assets from the grid.</p>
            </div>
            <div className="border-t border-destructive/10 bg-destructive/[0.03] px-10 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 relative z-10">
              <span className="text-xs text-muted-foreground font-semibold italic opacity-60">This operation cannot be undone. Authentication signals will be purged.</span>
              <button className="rounded-2xl bg-destructive/10 text-destructive border border-destructive/30 px-6 py-3 text-sm font-black hover:bg-destructive hover:text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] shrink-0 active:scale-95">Terminate Connection</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

