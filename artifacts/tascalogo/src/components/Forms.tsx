import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useCreateRestaurant, useCreateWishlistItem, useUpdateRestaurant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CUISINE_TYPES, PORTUGAL_DISTRICTS } from "@/lib/utils";
import { Star } from "lucide-react";
import { getListRestaurantsQueryKey, getListWishlistQueryKey } from "@workspace/api-client-react";
import type { Restaurant } from "@workspace/api-client-react/src/generated/api.schemas";

interface RestaurantFormProps {
  initialData?: Restaurant;
  onSuccess: () => void;
  defaultConcelho?: string;
}

export function RestaurantForm({ initialData, onSuccess, defaultConcelho }: RestaurantFormProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    concelho: initialData?.concelho || defaultConcelho || "",
    district: initialData?.district || "",
    cuisine: initialData?.cuisine || "",
    rating: initialData?.rating || 0,
    notes: initialData?.notes || "",
    visitDate: initialData?.visitDate ? initialData.visitDate.split("T")[0] : new Date().toISOString().split("T")[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.concelho || !formData.district) return;
    setError(null);

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: formData });
      } else {
        await createMutation.mutateAsync({ data: formData });
      }
      queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
      onSuccess();
    } catch (err: any) {
      console.error("Error saving restaurant", err);
      setError(err?.data?.error || err?.message || "Erro ao guardar. Tenta novamente.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Nome do Restaurante *</label>
        <Input 
          required 
          value={formData.name} 
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="Ex: Tasca do Zé"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Distrito *</label>
          <select 
            required
            value={formData.district}
            onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
            className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200"
          >
            <option value="" disabled>Selecione...</option>
            {PORTUGAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Concelho *</label>
          <Input 
            required 
            value={formData.concelho} 
            onChange={e => setFormData(p => ({ ...p, concelho: e.target.value }))}
            placeholder="Ex: Lisboa"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Tipo de Cozinha</label>
          <select 
            value={formData.cuisine}
            onChange={e => setFormData(p => ({ ...p, cuisine: e.target.value }))}
            className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200"
          >
            <option value="">Selecione...</option>
            {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Data da Visita</label>
          <Input 
            type="date"
            value={formData.visitDate} 
            onChange={e => setFormData(p => ({ ...p, visitDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Avaliação</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData(p => ({ ...p, rating: star }))}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star 
                className={`w-8 h-8 ${formData.rating >= star ? 'fill-primary text-primary' : 'text-border stroke-[1.5px]'}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Notas & Observações</label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          placeholder="O que achaste do espaço, serviço, prato favorito..."
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="pt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "A Guardar..." : initialData ? "Atualizar" : "Guardar Restaurante"}
        </Button>
      </div>
    </form>
  );
}

export function WishlistForm({ onSuccess, defaultConcelho }: { onSuccess: () => void, defaultConcelho?: string }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateWishlistItem();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    concelho: defaultConcelho || "",
    district: "",
    cuisine: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.concelho || !formData.district) return;
    setError(null);

    try {
      await createMutation.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
      onSuccess();
    } catch (err: any) {
      console.error("Error adding to wishlist", err);
      setError(err?.data?.error || err?.message || "Erro ao guardar. Tenta novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Nome do Restaurante *</label>
        <Input 
          required 
          value={formData.name} 
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="Ex: Cantinho do Mar"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Distrito *</label>
          <select 
            required
            value={formData.district}
            onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
            className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200"
          >
            <option value="" disabled>Selecione...</option>
            {PORTUGAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Concelho *</label>
          <Input 
            required 
            value={formData.concelho} 
            onChange={e => setFormData(p => ({ ...p, concelho: e.target.value }))}
            placeholder="Ex: Faro"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Tipo de Cozinha</label>
        <select 
          value={formData.cuisine}
          onChange={e => setFormData(p => ({ ...p, cuisine: e.target.value }))}
          className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200"
        >
          <option value="">Selecione...</option>
          {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Porquê visitar?</label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          placeholder="Foi recomendado por..."
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="pt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "A Guardar..." : "Adicionar à Wishlist"}
        </Button>
      </div>
    </form>
  );
}
