import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  onClick 
}) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700'
    },
    green: {
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700'
    },
    purple: {
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50',
      text: 'text-purple-700'
    },
    orange: {
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      text: 'text-orange-700'
    },
    red: {
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
      text: 'text-red-700'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Card 
      className={`
        backdrop-blur-xl bg-white/80 border-white/50 shadow-lg
        hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {value}
            </p>
            {trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}