import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Map from "@/components/Map";

interface Props {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const districts = [
  "Blantyre", "Chikwawa", "Chiradzulu", "Dedza", "Dowa", "Karonga",
  "Kasungu", "Lilongwe", "Machinga", "Mangochi", "Mchinji", "Mulanje",
  "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu",
  "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"
];

const landUses = [
  "Residential", "Commercial", "Agricultural", "Industrial",
  "Mixed Use", "Institutional", "Recreational"
];

const LandRegistrationForm = ({ userId, onSuccess, onCancel }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleDeedNumber: "",
    landSize: "",
    landUse: "",
    locationName: "",
    latitude: "",
    longitude: "",
    district: "",
    boundaries: "",
  });

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
    toast.success("Location selected on map");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("land_registrations").insert({
        applicant_id: userId,
        title_deed_number: formData.titleDeedNumber,
        land_size: parseFloat(formData.landSize),
        land_use: formData.landUse,
        location_name: formData.locationName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        district: formData.district,
        boundaries: formData.boundaries,
      });

      if (error) throw error;

      toast.success("Land registration submitted successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="titleDeed">Title Deed Number *</Label>
          <Input
            id="titleDeed"
            value={formData.titleDeedNumber}
            onChange={(e) => setFormData({ ...formData, titleDeedNumber: e.target.value })}
            required
            placeholder="TD-12345"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landSize">Land Size (hectares) *</Label>
          <Input
            id="landSize"
            type="number"
            step="0.01"
            value={formData.landSize}
            onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
            required
            placeholder="2.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landUse">Land Use *</Label>
          <Select value={formData.landUse} onValueChange={(value) => setFormData({ ...formData, landUse: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select land use" />
            </SelectTrigger>
            <SelectContent>
              {landUses.map((use) => (
                <SelectItem key={use} value={use}>
                  {use}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="locationName">Location Name *</Label>
          <Input
            id="locationName"
            value={formData.locationName}
            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
            required
            placeholder="e.g., Area 47, Section 12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude *</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
            placeholder="-13.962634"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude *</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
            placeholder="33.774119"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="boundaries">Boundaries Description</Label>
          <Textarea
            id="boundaries"
            value={formData.boundaries}
            onChange={(e) => setFormData({ ...formData, boundaries: e.target.value })}
            placeholder="Describe the boundaries of the property..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Location on Map</Label>
        <p className="text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Click on the map to set the property location
        </p>
        <Map
          center={
            formData.latitude && formData.longitude
              ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
              : { lat: -13.9626, lng: 33.7741 }
          }
          zoom={formData.latitude ? 15 : 6}
          onMapClick={handleMapClick}
          height="400px"
          markers={
            formData.latitude && formData.longitude
              ? [
                  {
                    id: "selected",
                    position: { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) },
                    title: "Selected Location",
                  },
                ]
              : []
          }
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Registration
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LandRegistrationForm;
