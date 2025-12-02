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
  // Build Google Maps embed URL using the standard embed format
  // If we have markers, use the first marker's position, otherwise use the center
  const mapLat = markers.length > 0 ? markers[0].position.lat : center.lat;
  const mapLng = markers.length > 0 ? markers[0].position.lng : center.lng;
  const mapZoom = markers.length > 0 ? 13 : zoom;
  
  // Use Google Maps embed URL (no API key needed for basic embed)
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d100000!2d${mapLng}!3d${mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${mapZoom}!5e0!3m2!1sen!2smw!4v1764620149036!5m2!1sen!2smw`;

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-primary/20" style={{ height }}>
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
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border-2 border-primary/30 max-w-xs animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm font-bold text-foreground">Land Locations ({markers.length})</p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {markers.map((marker, index) => (
              <div 
                key={marker.id} 
                className="text-xs p-2 bg-muted/50 rounded hover:bg-muted/80 transition-colors cursor-pointer border border-border/50"
                onClick={marker.onClick}
              >
                <div className="font-medium text-foreground">{index + 1}. {marker.title}</div>
                <div className="text-muted-foreground mt-1">
                  📍 {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
