"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import { mockActivityHistory } from "@/lib/mock";

export function AnalyticsChart() {
  return (
    <div className="rounded-[32px] border border-white/6 bg-background relative overflow-hidden card-grain shadow-2xl p-6 sm:p-8">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-1/2 h-[300px] bg-blue-600/4 blur-[100px] -z-10 rounded-full pointer-events-none" />
      
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

      <div className="flex items-center justify-between mb-8 relative z-10">
         <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Traffic Overview</h3>
            <p className="text-[13px] text-muted-foreground/80 mt-1">Daily visitors across all monitored properties.</p>
         </div>
      </div>

      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockActivityHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisits2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" strokeDashoffset={2} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dy={15} 
              tickMargin={10}
              fontWeight={600}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(9, 9, 11, 0.7)', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
              itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#60a5fa" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorVisits2)" 
              activeDot={{ r: 6, fill: "#60a5fa", stroke: "#09090b", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
