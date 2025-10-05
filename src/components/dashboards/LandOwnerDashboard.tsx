import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, FileText, Plus, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandRegistrationForm from "@/components/forms/LandRegistrationForm";
import LandsList from "@/components/lists/LandsList";
import RegistrationsList from "@/components/lists/RegistrationsList";

interface Props {
  userId: string;
}

const LandOwnerDashboard = ({ userId }: Props) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur animate-slide-up">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Land Owner Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{profile?.full_name}</span>
            </div>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
            <p className="text-muted-foreground">Manage your land properties and registrations</p>
          </div>
          {!showRegistrationForm && (
            <Button onClick={() => setShowRegistrationForm(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Register New Land
            </Button>
          )}
        </div>

        {showRegistrationForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Register New Land</CardTitle>
              <CardDescription>Fill in the details of your land property</CardDescription>
            </CardHeader>
            <CardContent>
              <LandRegistrationForm
                userId={userId}
                onSuccess={() => {
                  setShowRegistrationForm(false);
                  toast.success("Land registration submitted successfully!");
                }}
                onCancel={() => setShowRegistrationForm(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="properties" className="space-y-6">
            <TabsList>
              <TabsTrigger value="properties">
                <MapPin className="h-4 w-4 mr-2" />
                My Properties
              </TabsTrigger>
              <TabsTrigger value="registrations">
                <FileText className="h-4 w-4 mr-2" />
                Pending Registrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Properties</CardTitle>
                  <CardDescription>Your approved land properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <LandsList ownerId={userId} showMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Registrations</CardTitle>
                  <CardDescription>Track the status of your applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationsList applicantId={userId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default LandOwnerDashboard;
