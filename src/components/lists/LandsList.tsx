import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Ruler, Building } from "lucide-react";
import Map from "@/components/Map";

interface Props {
  ownerId?: string;
  showMap?: boolean;
  showOwner?: boolean;
  searchQuery?: string;
  district?: string;
  landUse?: string;
}

const LandsList = ({ ownerId, showMap = false, showOwner = false, searchQuery = "", district = "", landUse = "" }: Props) => {
  const [lands, setLands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLands();
  }, [ownerId, searchQuery, district, landUse]);

  const fetchLands = async () => {
    try {
      let query = supabase.from("lands").select(`
        *,
        profiles!lands_owner_id_fkey(full_name)
      `).eq("status", "active");

      if (ownerId) {
        query = query.eq("owner_id", ownerId);
      }

      if (searchQuery) {
        query = query.or(`title_deed_number.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%`);
      }

      if (district) {
        query = query.eq("district", district);
      }

      if (landUse) {
        query = query.eq("land_use", landUse);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLands(data || []);
    } catch (error) {
      console.error("Error fetching lands:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (lands.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No registered lands found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showMap && (
        <Map
          markers={lands.map((land) => ({
            id: land.id,
            position: { lat: parseFloat(land.latitude), lng: parseFloat(land.longitude) },
            title: land.location_name,
          }))}
          height="400px"
        />
      )}

      <div className="grid gap-4">
        {lands.map((land) => (
          <Card key={land.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{land.location_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Title Deed: {land.title_deed_number}</p>
                  {showOwner && land.profiles && (
                    <p className="text-sm text-muted-foreground">Owner: {land.profiles.full_name}</p>
                  )}
                </div>
                <Badge variant="secondary">{land.land_use}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{land.land_size} ha</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{land.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-xs">
                      {parseFloat(land.latitude).toFixed(4)}, {parseFloat(land.longitude).toFixed(4)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="default" className="mt-1">Active</Badge>
                </div>
              </div>
              {land.boundaries && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Boundaries:</p>
                  <p className="text-sm">{land.boundaries}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandsList;
