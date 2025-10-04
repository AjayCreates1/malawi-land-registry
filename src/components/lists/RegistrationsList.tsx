import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

interface Props {
  applicantId: string;
}

const RegistrationsList = ({ applicantId }: Props) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();

    // Set up realtime subscription
    const channel = supabase
      .channel('registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'land_registrations',
          filter: `applicant_id=eq.${applicantId}`,
        },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicantId]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("land_registrations")
        .select("*")
        .eq("applicant_id", applicantId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No pending registrations</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4">
      {registrations.map((registration) => (
        <Card key={registration.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{registration.location_name}</CardTitle>
                <p className="text-sm text-muted-foreground">Title Deed: {registration.title_deed_number}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(registration.submitted_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(registration.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
            </div>
            {registration.admin_notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-1">Admin Notes:</p>
                <p className="text-sm text-muted-foreground">{registration.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RegistrationsList;
