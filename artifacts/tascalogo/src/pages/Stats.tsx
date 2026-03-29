import React from "react";
import { useGetStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { MapPin, Utensils, Star, Heart, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function Stats() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-4xl font-serif font-bold text-foreground">As Tuas Estatísticas</h2>
        <p className="text-muted-foreground mt-2 text-lg">Um resumo da tua viagem gastronómica por Portugal.</p>
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Restaurantes</p>
              <h3 className="text-4xl font-serif font-bold text-foreground">{stats.totalRestaurants}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-secondary/10 border-secondary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Concelhos</p>
              <h3 className="text-4xl font-serif font-bold text-foreground">{stats.totalConcelhos}</h3>
              <p className="text-xs text-muted-foreground mt-2">de 308 no total</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-yellow-500/10 border-yellow-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Média Avaliação</p>
              <h3 className="text-4xl font-serif font-bold text-foreground">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
              </h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-600">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-pink-500/10 border-pink-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Na Wishlist</p>
              <h3 className="text-4xl font-serif font-bold text-foreground">{stats.totalWishlist}</h3>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-600">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Cuisines Chart */}
        <Card className="p-6 lg:p-8 flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-serif font-bold">Cozinhas Favoritas</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            {stats.topCuisines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCuisines} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="cuisine" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {stats.topCuisines.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index * 0.15)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Dados insuficientes</div>
            )}
          </div>
        </Card>

        {/* Most Visited Concelhos */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-secondary" />
            <h3 className="text-xl font-serif font-bold">Concelhos Mais Visitados</h3>
          </div>
          <div className="space-y-4">
            {stats.mostVisitedConcelhos.length > 0 ? (
              stats.mostVisitedConcelhos.map((c, i) => (
                <div key={c.concelho} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-xs">
                      {i + 1}
                    </div>
                    <span className="font-medium text-foreground">{c.concelho}</span>
                  </div>
                  <div className="font-serif font-bold text-lg text-primary">{c.count}</div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">Dados insuficientes</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
