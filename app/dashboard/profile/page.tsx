"use client";

import { Bell, LogOut, Shield, Smartphone } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Profile</h1>
        <p className="text-sm text-muted-foreground">Personal settings, sessions and notifications.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-black text-white">LA</div>
            <h2 className="mt-4 text-lg font-bold">Local Admin</h2>
            <p className="text-sm text-muted-foreground">admin@omniroute.local</p>
            <span className="mt-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">admin</span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border p-3 text-sm"><Smartphone className="mr-2 inline h-4 w-4 text-violet-400" />2FA: Not enabled</div>
            <div className="rounded-xl border p-3 text-sm"><Shield className="mr-2 inline h-4 w-4 text-emerald-500" />Sessions: 1 active</div>
            <div className="rounded-xl border p-3 text-sm"><Bell className="mr-2 inline h-4 w-4 text-blue-400" />Notifications: email</div>
          </div>
          <button className="mt-6 w-full rounded-xl border px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10"><LogOut className="mr-2 inline h-4 w-4" />Sign out</button>
        </div>

        <div className="rounded-2xl border p-5 lg:col-span-2">
          <h2 className="font-bold">Active sessions</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="font-semibold">This browser</div>
                <div className="text-xs text-muted-foreground">Chrome · localhost · now</div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-500">current</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="font-semibold">CLI</div>
                <div className="text-xs text-muted-foreground">omniroute connect · 2026-08-30</div>
              </div>
              <button className="rounded-xl border px-3 py-1.5 text-xs hover:bg-muted">Revoke</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
