import React, { useState } from "react";
import { useListWishlist, useDeleteWishlistItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListWishlistQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Trash2, Heart } from "lucide-react";

export function Wishlist() {
  const { data: wishlist, isLoading } = useListWishlist();
  const deleteMutation = useDeleteWishlistItem();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: number) => {
    if (confirm("Remover este restaurante da wishlist?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
    }
  };

  const filteredWishlist = wishlist?.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.concelho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card p-8 rounded-3xl shadow-sm border border-border/50 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-primary/5">
          <Heart className="w-64 h-64 fill-current" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-serif font-bold text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary/20" /> 
            Wishlist
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Locais que tens mesmo de experimentar ({wishlist?.length || 0}).</p>
        </div>
        
        <div className="relative w-full md:w-72 z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Procurar local..." 
            className="pl-9 bg-background/80 backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredWishlist?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-3xl border border-border/50 py-20">
          <Heart className="w-20 h-20 text-muted mb-4" />
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Nada por aqui</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Usa o mapa para adicionar restaurantes à tua wishlist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlist?.map(item => (
            <Card key={item.id} className="relative overflow-hidden group border-dashed border-2 hover:border-solid hover:border-primary/50 transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-bold text-2xl leading-tight pr-8">{item.name}</h3>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span>{item.concelho}, {item.district}</span>
                </div>
                
                {item.cuisine && (
                  <div className="mb-4">
                    <span className="text-xs px-2.5 py-1 bg-secondary/10 text-secondary-foreground rounded-md font-medium">
                      {item.cuisine}
                    </span>
                  </div>
                )}
                
                {item.notes && (
                  <p className="text-sm text-foreground/80 mt-4 pt-4 border-t border-border/50">
                    {item.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
