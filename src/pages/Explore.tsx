import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home } from "lucide-react";
import LandsList from "@/components/lists/LandsList";

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ district: "", landUse: "" });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Land Registry Portal</span>
          </div>
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Land Records</h1>
          <p className="text-muted-foreground">
            Search and view all registered and approved land properties across Malawi
          </p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Land Records</CardTitle>
            <CardDescription>
              Find land properties by title deed number, location, or district
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by title deed number or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Input
                placeholder="Filter by district"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              />
              <Input
                placeholder="Filter by land use"
                value={filters.landUse}
                onChange={(e) => setFilters({ ...filters, landUse: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Land Properties</CardTitle>
            <CardDescription>Browse all publicly registered and approved lands</CardDescription>
          </CardHeader>
          <CardContent>
            <LandsList 
              showMap 
              showOwner 
              searchQuery={searchQuery}
              district={filters.district}
              landUse={filters.landUse}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Explore;
