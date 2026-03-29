import React, { useState } from "react";
import { useListRestaurants, useDeleteRestaurant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { RestaurantForm } from "@/components/Forms";
import { Star, MapPin, Search, Calendar, Edit, Trash2 } from "lucide-react";

export function Directory() {
  const { data: restaurants, isLoading } = useListRestaurants();
  const deleteMutation = useDeleteRestaurant();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("");
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (confirm("Eliminar definitivamente este restaurante?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
    }
  };

  const filteredRestaurants = restaurants?.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.concelho.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = filterCuisine ? r.cuisine === filterCuisine : true;
    return matchesSearch && matchesCuisine;
  });

  // Extract unique cuisines for the filter dropdown
  const uniqueCuisines = Array.from(new Set(restaurants?.map(r => r.cuisine).filter(Boolean) as string[]));

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-foreground">O Meu Catálogo</h2>
          <p className="text-muted-foreground mt-2 text-lg">Todos os {restaurants?.length || 0} restaurantes que já visitaste.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Procurar nome ou concelho..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterCuisine}
            onChange={(e) => setFilterCuisine(e.target.value)}
            className="flex h-12 rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary transition-all"
          >
            <option value="">Todas as cozinhas</option>
            {uniqueCuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredRestaurants?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-3xl border border-border/50 py-20">
          <img src={`${import.meta.env.BASE_URL}images/empty-plate.png`} alt="Vazio" className="w-48 h-48 opacity-50 mb-6 mix-blend-multiply" />
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Nenhum resultado</h3>
          <p className="text-muted-foreground">Tenta ajustar a tua pesquisa ou adiciona novos restaurantes pelo mapa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredRestaurants?.map(restaurant => (
            <Card key={restaurant.id} className="flex flex-col h-full overflow-hidden group">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-bold text-xl leading-tight line-clamp-2">{restaurant.name}</h3>
                  {restaurant.rating && (
                    <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold shadow-sm shrink-0 ml-2">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {restaurant.rating}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">{restaurant.concelho}, {restaurant.district}</span>
                </div>
                
                {restaurant.cuisine && (
                  <div className="mb-4">
                    <span className="text-xs px-2.5 py-1 bg-accent rounded-md font-medium text-accent-foreground">
                      {restaurant.cuisine}
                    </span>
                  </div>
                )}
                
                {restaurant.notes && (
                  <p className="text-sm text-foreground/80 line-clamp-3 italic bg-muted/40 p-3 rounded-xl flex-1 mb-4">
                    "{restaurant.notes}"
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground flex items-center">
                    {restaurant.visitDate && (
                      <>
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(restaurant.visitDate).toLocaleDateString('pt-PT')}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingRestaurant(restaurant)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(restaurant.id)} className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={!!editingRestaurant} 
        onClose={() => setEditingRestaurant(null)} 
        title="Editar Restaurante"
      >
        {editingRestaurant && (
          <RestaurantForm 
            initialData={editingRestaurant} 
            onSuccess={() => setEditingRestaurant(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
