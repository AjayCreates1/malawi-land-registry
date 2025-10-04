import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, MapPin, Users, LogOut, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PendingRegistrationsList from "@/components/lists/PendingRegistrationsList";
import LandsList from "@/components/lists/LandsList";

interface Props {
  userId: string;
}

const AdminDashboard = ({ userId }: Props) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLands: 0,
    pendingRegistrations: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    const [landsResult, registrationsResult, usersResult] = await Promise.all([
      supabase.from("lands").select("*", { count: "exact", head: true }),
      supabase.from("land_registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalLands: landsResult.count || 0,
      pendingRegistrations: registrationsResult.count || 0,
      totalUsers: usersResult.count || 0,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-accent" />
              <span className="font-medium">{profile?.full_name}</span>
            </div>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage land registrations and system users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Registered Lands</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLands}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-secondary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              <FileText className="h-4 w-4 mr-2" />
              Pending Applications
            </TabsTrigger>
            <TabsTrigger value="approved">
              <MapPin className="h-4 w-4 mr-2" />
              All Registered Lands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Land Registrations</CardTitle>
                <CardDescription>Review and approve or reject land registration applications</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingRegistrationsList adminId={userId} onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>All Registered Lands</CardTitle>
                <CardDescription>View all approved land properties in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <LandsList showMap showOwner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
