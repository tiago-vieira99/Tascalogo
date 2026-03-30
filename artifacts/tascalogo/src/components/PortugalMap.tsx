import { useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useListRestaurants, useListWishlist } from "@workspace/api-client-react";

const GEO_URL = "/concelhos.geojson";

interface PortugalMapProps {
  selectedConcelho: string | null;
  onSelectConcelho: (name: string) => void;
}

export function PortugalMap({ selectedConcelho, onSelectConcelho }: PortugalMapProps) {
  const { data: restaurants } = useListRestaurants();
  const { data: wishlist } = useListWishlist();

  // Calculate stats per concelho to drive map colors
  const concelhoStats = useMemo(() => {
    const stats: Record<string, { visited: number, wishlist: number }> = {};

    restaurants?.forEach(r => {
      const c = r.concelho.toUpperCase();
      if (!stats[c]) stats[c] = { visited: 0, wishlist: 0 };
      stats[c].visited += 1;
    });

    wishlist?.forEach(w => {
      const c = w.concelho.toUpperCase();
      if (!stats[c]) stats[c] = { visited: 0, wishlist: 0 };
      stats[c].wishlist += 1;
    });

    return stats;
  }, [restaurants, wishlist]);

  return (
    <div className="w-full h-[60vh] lg:h-[85vh] bg-accent/20 rounded-3xl overflow-hidden border-2 border-border/60 shadow-inner relative map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-8.2245, 39.5],
          scale: 6500,
        }}
        className="w-full h-full cursor-pointer outline-none"
      >
        <ZoomableGroup center={[-8.2245, 39.5]} zoom={1} maxZoom={5}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const concelhoName = geo.properties.NAME_2;
                const normalizedName = concelhoName?.toUpperCase() || "";
                const stats = concelhoStats[normalizedName];
                const isSelected = selectedConcelho?.toUpperCase() === normalizedName;

                // Determine fill color
                let fill = "hsl(var(--card))";
                let stroke = "hsl(var(--border))";
                let strokeWidth = 0.5;

                if (isSelected) {
                  fill = "hsl(var(--primary) / 0.8)";
                  stroke = "hsl(var(--primary))";
                  strokeWidth = 1.5;
                } else if (stats?.visited > 0) {
                  // The more visited, the darker the terracotta
                  const opacity = Math.min(0.4 + (stats.visited * 0.15), 1);
                  fill = `hsl(var(--primary) / ${opacity})`;
                  stroke = "hsl(var(--primary))";
                } else if (stats?.wishlist > 0) {
                  fill = "hsl(var(--secondary) / 0.4)";
                  stroke = "hsl(var(--secondary))";
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onSelectConcelho(concelhoName)}
                    style={{
                      default: {
                        fill,
                        stroke,
                        strokeWidth,
                        outline: "none",
                        transition: "all 250ms ease",
                      },
                      hover: {
                        fill: "hsl(var(--primary) / 0.6)",
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 1,
                        outline: "none",
                        transition: "all 250ms ease",
                      },
                      pressed: {
                        fill: "hsl(var(--primary))",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute bottom-6 left-6 glass-panel px-4 py-3 rounded-xl flex flex-col gap-2 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary opacity-80 border border-primary"></div>
          <span>Visitados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-secondary opacity-40 border border-secondary"></div>
          <span>Wishlist</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="text-muted-foreground">Scrole para zoom. Arraste para mover.</div>
        </div>
      </div>
    </div>
  );
}
