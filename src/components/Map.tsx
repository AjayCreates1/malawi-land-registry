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

const Map = ({ height = "600px" }: MapProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d304906.44973769883!2d33.82747774476899!3d-13.685584806004114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2smw!4v1764620149036!5m2!1sen!2smw" 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Malawi Map"
      />
    </div>
  );
};

export default Map;
