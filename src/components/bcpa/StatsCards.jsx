import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Home, TrendingUp, FileSignature, CheckCircle, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCards({ stats }) {
  const cards = [
    { 
      label: 'Total Properties', 
      value: stats.total || 0,
      icon: Home, 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'New Leads', 
      value: stats.newLeads || 0,
      icon: TrendingUp, 
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600'
    },
    { 
      label: 'Under Contract', 
      value: stats.underContract || 0,
      icon: FileSignature, 
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    { 
      label: 'Closed Deals', 
      value: stats.sold || 0,
      icon: CheckCircle, 
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'High Equity', 
      value: stats.highEquity || 0,
      icon: DollarSign, 
      color: 'cyan',
      gradient: 'from-cyan-500 to-teal-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      subtext: '$100k+ equity'
    },
    { 
      label: 'Absentee Owners', 
      value: stats.absentee || 0,
      icon: Users, 
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group cursor-pointer">
              {/* Subtle gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardContent className="p-5 relative">
                {/* Icon with gradient background */}
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm mb-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                
                {/* Value */}
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value.toLocaleString()}
                </p>
                
                {/* Label */}
                <p className="text-sm text-slate-500 font-medium mt-1">{card.label}</p>
                
                {/* Optional subtext */}
                {card.subtext && (
                  <p className="text-xs text-slate-400 mt-0.5">{card.subtext}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
