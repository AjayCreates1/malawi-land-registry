import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    initMap();
  }, [apiKey]);

  useEffect(() => {
    if (map && markers.length > 0 && (window as any).google) {
      markers.forEach((marker) => {
        new (window as any).google.maps.Marker({
          position: marker.position,
          map: map,
          title: marker.title,
        });
      });
    }
  }, [map, markers]);

  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      const key = apiKey || "";
      
      if (!key) {
        setNeedsApiKey(true);
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        if (onMapClick) {
          mapInstance.addListener("click", (e: any) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setMap(mapInstance);
        setNeedsApiKey(false);
        setLoading(false);
      };

      script.onerror = () => {
        toast.error("Failed to load Google Maps");
        setLoading(false);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Map loading error:", error);
      toast.error("Failed to load map");
      setLoading(false);
    }
  };

  if (needsApiKey && !apiKey) {
    return (
      <div className="border rounded-lg p-8 bg-muted/50" style={{ height }}>
        <div className="max-w-md mx-auto space-y-4 text-center">
          <h3 className="text-lg font-semibold">Google Maps API Key Required</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your Google Maps API key to view the map. Get your key from{" "}
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter Google Maps API Key"
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
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
