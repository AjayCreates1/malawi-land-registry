import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import Map from "@/components/Map";

interface Props {
  adminId: string;
  onUpdate: () => void;
}

const PendingRegistrationsList = ({ adminId, onUpdate }: Props) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchRegistrations();

    // Set up realtime subscription
    const channel = supabase
      .channel('pending_registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'land_registrations',
        },
        () => {
          fetchRegistrations();
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("land_registrations")
        .select(`
          *,
          profiles!land_registrations_applicant_id_fkey(full_name)
        `)
        .eq("status", "pending")
        .order("submitted_at", { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registration: any) => {
    setProcessingId(registration.id);
    try {
      // Create land entry
      const { error: landError } = await supabase.from("lands").insert({
        owner_id: registration.applicant_id,
        title_deed_number: registration.title_deed_number,
        land_size: registration.land_size,
        land_use: registration.land_use,
        location_name: registration.location_name,
        latitude: registration.latitude,
        longitude: registration.longitude,
        district: registration.district,
        boundaries: registration.boundaries,
        status: "active",
      });

      if (landError) throw landError;

      // Update registration status
      const { error: updateError } = await supabase
        .from("land_registrations")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          admin_notes: adminNotes[registration.id] || "Approved",
        })
        .eq("id", registration.id);

      if (updateError) throw updateError;

      toast.success("Registration approved successfully!");
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve registration");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    setProcessingId(registrationId);
    try {
      const { error } = await supabase
        .from("land_registrations")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          admin_notes: adminNotes[registrationId] || "Rejected",
        })
        .eq("id", registrationId);

      if (error) throw error;

      toast.success("Registration rejected");
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject registration");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No pending registrations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {registrations.map((registration) => (
        <Card key={registration.id} className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{registration.location_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Applicant: {registration.profiles?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Title Deed: {registration.title_deed_number}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(registration.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary">Pending Review</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Land Size</p>
                <p className="font-medium">{registration.land_size} hectares</p>
              </div>
              <div>
                <p className="text-muted-foreground">Land Use</p>
                <p className="font-medium">{registration.land_use}</p>
              </div>
              <div>
                <p className="text-muted-foreground">District</p>
                <p className="font-medium">{registration.district}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Coordinates</p>
                <p className="font-medium text-xs">
                  {parseFloat(registration.latitude).toFixed(4)},{" "}
                  {parseFloat(registration.longitude).toFixed(4)}
                </p>
              </div>
            </div>

            {registration.boundaries && (
              <div>
                <p className="text-sm font-medium mb-1">Boundaries:</p>
                <p className="text-sm text-muted-foreground">{registration.boundaries}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location on Map
              </p>
              <Map
                center={{
                  lat: parseFloat(registration.latitude),
                  lng: parseFloat(registration.longitude),
                }}
                zoom={15}
                height="300px"
                markers={[
                  {
                    id: registration.id,
                    position: {
                      lat: parseFloat(registration.latitude),
                      lng: parseFloat(registration.longitude),
                    },
                    title: registration.location_name,
                  },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${registration.id}`}>Admin Notes</Label>
              <Textarea
                id={`notes-${registration.id}`}
                placeholder="Add notes about this registration..."
                value={adminNotes[registration.id] || ""}
                onChange={(e) =>
                  setAdminNotes({ ...adminNotes, [registration.id]: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleApprove(registration)}
                disabled={processingId === registration.id}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {processingId === registration.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                onClick={() => handleReject(registration.id)}
                disabled={processingId === registration.id}
                variant="destructive"
                className="flex-1"
              >
                {processingId === registration.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingRegistrationsList;
