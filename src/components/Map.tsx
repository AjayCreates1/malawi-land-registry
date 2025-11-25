import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    onClick?: () => void;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
}

const Map = ({ center = { lat: -13.9626, lng: 33.7741 }, zoom = 6, markers = [], onMapClick, height = "600px" }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const mapLoadedRef = useRef(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (result.data?.apiKey) {
          setApiKey(result.data.apiKey);
        } else {
          setNeedsApiKey(true);
          setLoading(false);
        }
      } catch {
        setNeedsApiKey(true);
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (apiKey && !mapLoadedRef.current) {
      initMap();
    }
  }, [apiKey]);

  useEffect(() => {
    if (map.current && markers.length > 0) {
      markers.forEach((marker) => {
        new maplibregl.Marker()
          .setLngLat([marker.position.lng, marker.position.lat])
          .setPopup(new maplibregl.Popup().setText(marker.title))
          .addTo(map.current!);
      });
    }
  }, [map.current, markers]);

  const initMap = async () => {
    if (!mapContainer.current || mapLoadedRef.current) return;

    try {
      const key = apiKey || "";
      
      if (!key) {
        setNeedsApiKey(true);
        setLoading(false);
        return;
      }

      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${key}`,
        center: [center.lng, center.lat],
        zoom: zoom,
      });

      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

      if (onMapClick) {
        mapInstance.on('click', (e) => {
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        });
      }

      mapInstance.on('load', async () => {
        console.log('Map loaded, loading districts...');
        
        // Load Malawi districts GeoJSON
        try {
          const response = await fetch('/malawi-districts.geojson');
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }
          const geojsonData = await response.json();
          console.log('GeoJSON loaded, features:', geojsonData.features?.length);
          
          // Add source
          mapInstance.addSource('malawi-districts', {
            type: 'geojson',
            data: geojsonData
          });
          
          // Add district fill layer (add first so it's below)
          mapInstance.addLayer({
            id: 'district-fills',
            type: 'fill',
            source: 'malawi-districts',
            paint: {
              'fill-color': '#FFD700',
              'fill-opacity': 0.15
            }
          });
          
          // Add district boundaries layer (thicker and more visible)
          mapInstance.addLayer({
            id: 'district-boundaries',
            type: 'line',
            source: 'malawi-districts',
            paint: {
              'line-color': '#FFD700',
              'line-width': 3,
              'line-opacity': 1
            }
          });
          
          // Add district labels (fallback across common name fields)
          mapInstance.addLayer({
            id: 'district-labels',
            type: 'symbol',
            source: 'malawi-districts',
            layout: {
              'text-field': ['coalesce', ['get', 'shapeName'], ['get', 'ADM1_EN'], ['get', 'NAME_1'], ['get', 'name']],
              'text-size': 14,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
            },
            paint: {
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 2
            }
          });
          
          console.log('Districts layers added successfully');
        } catch (error) {
          console.error('Error loading districts:', error);
          toast.error('Failed to load district boundaries');
        }
        
        setNeedsApiKey(false);
        setLoading(false);
        mapLoadedRef.current = true;
      });

      mapInstance.on('error', () => {
        toast.error("Failed to load map");
        setNeedsApiKey(true);
        setLoading(false);
      });

      map.current = mapInstance;
    } catch (error) {
      console.error("Map loading error:", error);
      toast.error("Failed to load map");
      setNeedsApiKey(true);
      setLoading(false);
    }
  };

  if (needsApiKey && !apiKey) {
    return (
      <div className="border rounded-lg p-8 bg-muted/50" style={{ height }}>
        <div className="max-w-md mx-auto space-y-4 text-center">
          <h3 className="text-lg font-semibold">MapTiler API Key Required</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your MapTiler API key to view the map. Get your key from{" "}
            <a
              href="https://cloud.maptiler.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MapTiler Cloud
            </a>
          </p>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter MapTiler API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={() => initMap()} className="w-full">
              Load Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;
