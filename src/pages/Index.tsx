import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Shield, Users, Search, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (session) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Malawi Land Registry</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Button onClick={() => navigate("/dashboard")} variant="default">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate("/auth")} variant="ghost">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} variant="default">
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background"></div>
        <div className="container relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Digital Land Registry for Malawi
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure, transparent, and efficient land registration system. Register your property,
              verify ownership, and explore land records with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGetStarted} size="lg" className="text-lg px-8">
                Get Started
              </Button>
              <Button onClick={() => navigate("/explore")} size="lg" variant="outline" className="text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Explore Lands
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our System?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A modern, secure platform built for efficiency and transparency
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure & Verified</h3>
                <p className="text-muted-foreground">
                  All registrations are verified by authorized administrators ensuring authenticity
                  and legal compliance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-secondary/10">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Interactive Maps</h3>
                <p className="text-muted-foreground">
                  View property boundaries and locations on interactive maps with precise GPS
                  coordinates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-accent/10">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Registration</h3>
                <p className="text-muted-foreground">
                  Simple and intuitive process for registering new land titles with digital
                  documentation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple steps to register and manage your land
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Create Account", desc: "Sign up as a land owner" },
              { icon: FileText, title: "Submit Details", desc: "Fill in property information" },
              { icon: Shield, title: "Admin Review", desc: "Verification by authorities" },
              { icon: CheckCircle, title: "Get Approved", desc: "Receive digital certificate" },
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold mb-1">Step {index + 1}</h3>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary via-secondary to-accent text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Register Your Land?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of property owners securing their land rights with our digital platform
          </p>
          <Button onClick={handleGetStarted} size="lg" variant="secondary" className="text-lg px-8">
            Start Registration
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Malawi Land Registry System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
