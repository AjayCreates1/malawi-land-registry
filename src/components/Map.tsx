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
  // Build Google Maps embed URL with center and zoom
  const embedUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tGY6dkeXj1CaU9dZQk&center=${center.lat},${center.lng}&zoom=${zoom}`;

  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm font-medium mb-2">Locations ({markers.length}):</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {markers.map((marker) => (
              <div key={marker.id} className="text-xs text-muted-foreground">
                • {marker.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
