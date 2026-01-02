import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from 'lucide-react';

export default function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  page, 
  color,
  badge,
  badgeColor = 'red'
}) {
  return (
    <Link to={createPageUrl(page)}>
      <Card className="
        backdrop-blur-xl bg-white/80 border-white/50 shadow-lg
        hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
        cursor-pointer group overflow-hidden h-full
      ">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-br ${color}
              flex items-center justify-center shadow-lg flex-shrink-0
              group-hover:scale-110 transition-transform duration-300
            `}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 truncate">
                  {title}
                </h3>
                {badge && (
                  <Badge className={`
                    ${badgeColor === 'red' ? 'bg-red-500' : 'bg-blue-500'} 
                    text-white text-[10px] px-1.5 animate-pulse
                  `}>
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}