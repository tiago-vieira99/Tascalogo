import React, { useState } from "react";
import { PortugalMap } from "@/components/PortugalMap";
import { Modal } from "@/components/ui/modal";
import { RestaurantForm, WishlistForm } from "@/components/Forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Calendar, Trash2, Edit } from "lucide-react";
import { useListRestaurants, useListWishlist, useDeleteRestaurant, useDeleteWishlistItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListRestaurantsQueryKey, getListWishlistQueryKey } from "@workspace/api-client-react";

export function Home() {
  const [selectedConcelho, setSelectedConcelho] = useState<string | null>(null);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);

  const { data: restaurants } = useListRestaurants({ concelho: selectedConcelho || undefined });
  const { data: wishlist } = useListWishlist({ concelho: selectedConcelho || undefined });
  
  const deleteRestaurant = useDeleteRestaurant();
  const deleteWishlist = useDeleteWishlistItem();
  const queryClient = useQueryClient();

  // If no concelho is selected, the API fetches ALL, but we only want to show the list if a concelho is selected in the sidebar.
  const concelhoRestaurants = selectedConcelho ? restaurants?.filter(r => r.concelho.toLowerCase() === selectedConcelho.toLowerCase()) || [] : [];
  const concelhoWishlist = selectedConcelho ? wishlist?.filter(w => w.concelho.toLowerCase() === selectedConcelho.toLowerCase()) || [] : [];

  const handleDeleteRestaurant = async (id: number) => {
    if (confirm("Tem a certeza que deseja eliminar este registo?")) {
      await deleteRestaurant.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
    }
  };

  const handleDeleteWishlist = async (id: number) => {
    if (confirm("Remover da wishlist?")) {
      await deleteWishlist.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <header className="mb-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">O Meu Mapa</h2>
          <p className="text-muted-foreground mt-1 text-lg">Clica num concelho para ver ou adicionar restaurantes.</p>
        </header>
        <PortugalMap 
          selectedConcelho={selectedConcelho} 
          onSelectConcelho={setSelectedConcelho} 
        />
      </div>

      <div className="w-full xl:w-1/3 flex flex-col">
        {selectedConcelho ? (
          <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-6 h-full flex flex-col overflow-hidden relative">
            
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-accent/20 rounded-t-3xl border-b border-border/50"></div>
            
            <div className="relative z-10 mb-8 pt-4">
              <div className="inline-flex items-center justify-center p-3 bg-background shadow-sm border border-border rounded-2xl mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-foreground">{selectedConcelho}</h3>
              <div className="flex gap-4 mt-4">
                <Button size="sm" onClick={() => setIsRestaurantModalOpen(true)} className="flex-1">
                  + Visitei
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsWishlistModalOpen(true)} className="flex-1">
                  + Wishlist
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar relative z-10">
              {/* Visitados */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border/50 pb-2">
                  Visitados ({concelhoRestaurants.length})
                </h4>
                {concelhoRestaurants.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Ainda não adicionou nenhum restaurante aqui.</p>
                ) : (
                  <div className="space-y-4">
                    {concelhoRestaurants.map(r => (
                      <Card key={r.id} className="p-4 group">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-serif font-bold text-lg leading-tight">{r.name}</h5>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingRestaurant(r); setIsRestaurantModalOpen(true); }} className="text-muted-foreground hover:text-primary p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteRestaurant(r.id)} className="text-muted-foreground hover:text-destructive p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {r.cuisine && <span className="text-xs px-2 py-1 bg-accent/50 rounded-md font-medium">{r.cuisine}</span>}
                          {r.rating && (
                            <span className="flex items-center text-xs px-2 py-1 bg-yellow-100/50 text-yellow-700 rounded-md font-medium">
                              <Star className="w-3 h-3 fill-current mr-1" /> {r.rating}/5
                            </span>
                          )}
                        </div>
                        
                        {r.notes && <p className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-lg mb-3 italic">"{r.notes}"</p>}
                        
                        {r.visitDate && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(r.visitDate).toLocaleDateString('pt-PT')}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border/50 pb-2">
                  Wishlist ({concelhoWishlist.length})
                </h4>
                {concelhoWishlist.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Wishlist vazia para este concelho.</p>
                ) : (
                  <div className="space-y-4">
                    {concelhoWishlist.map(w => (
                      <Card key={w.id} className="p-4 border-dashed border-2 opacity-80 hover:opacity-100 group">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-serif font-bold text-lg leading-tight">{w.name}</h5>
                          <button onClick={() => handleDeleteWishlist(w.id)} className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {w.cuisine && <span className="text-xs px-2 py-1 bg-accent/50 rounded-md font-medium inline-block mb-2">{w.cuisine}</span>}
                        {w.notes && <p className="text-sm text-foreground/70">{w.notes}</p>}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center">
            <img src={`${import.meta.env.BASE_URL}images/empty-plate.png`} alt="Prato Vazio" className="w-48 h-48 object-contain mb-6 opacity-80 mix-blend-multiply" />
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Onde vamos comer?</h3>
            <p className="text-muted-foreground max-w-sm">
              Seleciona um concelho no mapa para registares a tua experiência ou planeares a próxima visita.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isRestaurantModalOpen} 
        onClose={() => { setIsRestaurantModalOpen(false); setEditingRestaurant(null); }} 
        title={editingRestaurant ? "Editar Restaurante" : "Registar Visita"}
      >
        <RestaurantForm 
          initialData={editingRestaurant}
          defaultConcelho={selectedConcelho || ""} 
          onSuccess={() => { setIsRestaurantModalOpen(false); setEditingRestaurant(null); }} 
        />
      </Modal>

      <Modal 
        isOpen={isWishlistModalOpen} 
        onClose={() => setIsWishlistModalOpen(false)} 
        title="Adicionar à Wishlist"
      >
        <WishlistForm 
          defaultConcelho={selectedConcelho || ""} 
          onSuccess={() => setIsWishlistModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
