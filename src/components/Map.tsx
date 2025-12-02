import { useEffect, useRef } from "react";
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
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with MapTiler key
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=aQGSTvwPxi3wKiQwyNwz`,
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    if (onMapClick) {
      mapInstance.on('click', (e) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    map.current = mapInstance;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        background-color: #ef4444;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([markerData.position.lng, markerData.position.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong style="font-size: 14px;">${markerData.title}</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                ${markerData.position.lat.toFixed(4)}, ${markerData.position.lng.toFixed(4)}
              </p>
            </div>`
          )
        )
        .addTo(map.current!);

      if (markerData.onClick) {
        el.addEventListener('click', markerData.onClick);
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend([marker.position.lng, marker.position.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [markers]);

  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;
