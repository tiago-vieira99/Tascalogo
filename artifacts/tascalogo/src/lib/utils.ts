import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map of Portugal districts to regions for coloring or grouping
export const PORTUGAL_DISTRICTS = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra",
  "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre",
  "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu",
  "Açores", "Madeira"
];

export const CUISINE_TYPES = [
  "Portuguesa", "Italiana", "Japonesa", "Chinesa", "Mexicana", 
  "Indiana", "Francesa", "Marroquina", "Espanhola", "Americana", 
  "Vegetariana", "Mediterrânica", "Outra"
];
