"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUser } from "@/lib/mock";
import { SITE_HOST } from "@/lib/site";

export function SettingsPage() {
  return (
    <div className="space-y-8 max-w-[1000px] mx-auto pb-20 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both">
      {/* Header */}
      <div className="mt-4">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          General Settings
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
          Manage your account profile, primary details, and deployment
          preferences.
        </p>
      </div>

      <div className="space-y-10">
        {/* Profile Card */}
        <div className="rounded-[32px] border border-white/6 bg-background relative overflow-hidden card-grain shadow-2xl">
          <div className="absolute top-0 right-1/4 w-1/2 h-[200px] bg-blue-600/3 blur-[80px] -z-10 rounded-full" />

          <div className="p-8 sm:p-10 relative z-10">
            <div className="mb-10">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Profile Data
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                These details represent your primary identity across the
                Multivrs interface and Edge logs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-10">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full overflow-hidden border border-white/10 ring-[3px] ring-white/5 shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.name}
                    className="h-full w-full object-cover transition-all duration-500 scale-100 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <Button size="lg" className="px-6 py-2.5 text-[13px]">
                  Upload Avatar
                </Button>
                <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">
                  Recommended: 400x400 JPG/PNG
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    defaultValue={mockUser.name}
                    className="px-5 py-3.5 text-[13px]"
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Primary Email Node
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    defaultValue={mockUser.email}
                    className="px-5 py-3.5 text-[13px]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 bg-white/1 px-8 sm:px-10 py-5 flex justify-end relative z-10 transition-colors">
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-8 py-3 text-[13px] border-transparent"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Workspace Preferences */}
        <div className="rounded-[32px] border border-white/6 bg-background relative overflow-hidden card-grain shadow-xl">
          <div className="p-8 sm:p-10 relative z-10">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Workspace Identity
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                This is your workspace&apos;s canonical identifier. It must be
                unique across all active nodes.
              </p>
            </div>

            <div className="space-y-2.5 max-w-md">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Workspace Slug
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-[13px] font-bold text-muted-foreground/50 select-none">
                  {SITE_HOST}/
                </span>
                <Input
                  type="text"
                  defaultValue="personal"
                  className="pl-[105px] pr-5 py-3.5 text-[13px]"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 bg-white/1 px-8 sm:px-10 py-5 flex justify-end">
            <Button size="lg" className="px-8 py-3 text-[13px]">
              Update Slug
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-[32px] border border-destructive/20 bg-background relative overflow-hidden card-grain shadow-2xl group border-t-2 border-t-destructive/40">
          <div className="absolute top-0 right-1/4 w-1/2 h-[150px] bg-destructive/5 blur-[80px] -z-10 rounded-full transition-all group-hover:bg-destructive/10" />
          <div className="p-8 sm:p-10 relative z-10">
            <h3 className="text-lg font-bold text-foreground">
              Archive Workspace
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
              Permanently disconnect and purge all associated project assets,
              logs, and edge networks from this workspace.
            </p>
          </div>
          <div className="border-t border-destructive/10 bg-destructive/2 px-8 sm:px-10 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 relative z-10">
            <span className="text-[12px] text-muted-foreground/80 font-medium italic">
              This operation cannot be undone. Authentication signals will be
              purged.
            </span>
            <Button
              variant="destructive"
              size="lg"
              className="px-6 py-2.5 text-[13px]"
            >
              Terminate Connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
