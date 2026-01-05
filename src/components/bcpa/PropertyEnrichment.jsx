import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, ExternalLink, Home, School, Map, DollarSign, 
  Image, Building2, Navigation, Camera, GraduationCap,
  TrendingUp, Star
} from "lucide-react";

// Build search URLs for various services
const buildSearchUrls = (property) => {
  if (!property) return {};
  
  const address = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type
  ].filter(Boolean).join(' ');
  
  const fullAddress = `${address}, ${property.situs_city || 'FL'}, FL ${property.situs_zip || ''}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const encodedCity = encodeURIComponent(property.situs_city || 'Broward County');
  const encodedZip = encodeURIComponent(property.situs_zip || '');
  
  return {
    // Property Listings
    zillow: `https://www.zillow.com/homes/${encodedAddress}_rb/`,
    redfin: `https://www.redfin.com/search?query=${encodedAddress}`,
    realtor: `https://www.realtor.com/realestateandhomes-search/${encodedAddress.replace(/%20/g, '-')}`,
    trulia: `https://www.trulia.com/for_sale/${encodedAddress.replace(/%20/g, '_')}`,
    
    // REIPro
    reipro: `https://app.myreipro.com/dashboard`,
    reiproSearch: `https://app.myreipro.com/properties?address=${encodedAddress}`,
    
    // Maps
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    googleStreetView: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodedAddress}`,
    
    // Schools
    greatSchools: `https://www.greatschools.org/search/search.page?q=${encodedZip || encodedCity}&gradeLevels=e%2Cm%2Ch`,
    niche: `https://www.niche.com/k12/search/best-schools/?searchType=school&zip=${property.situs_zip || ''}`,
    
    // Property Data
    bcpa: `https://gisweb-adapters.bcpa.net/bcpawebmap_ex_new_web/bcpawebmap.aspx?FOLIO=${property.folio_number}`,
    propertyShark: `https://www.propertyshark.com/mason/Property/${encodedAddress}/`,
    
    // Rentals
    rentometer: `https://www.rentometer.com/analysis/results?address=${encodedAddress}`,
    zillow_rent: `https://www.zillow.com/rental-manager/price-my-rental/results/${encodedAddress.replace(/%20/g, '-')}/`,
  };
};

// Google Maps Embed URL (no API key required for basic embed)
const getGoogleMapsEmbedUrl = (property) => {
  if (!property) return '';
  
  const address = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type,
    property.situs_city,
    'FL',
    property.situs_zip
  ].filter(Boolean).join(' ');
  
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=18&output=embed`;
};

// Street View Static Image URL (basic, works without API key for low volume)
const getStreetViewUrl = (property) => {
  if (!property) return '';
  
  const address = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type,
    property.situs_city,
    'FL',
    property.situs_zip
  ].filter(Boolean).join(' ');
  
  // This creates a link to open Street View
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&layer=c&cbll=0,0&cbp=11,0,0,0,0`;
};

export default function PropertyEnrichment({ property }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const urls = useMemo(() => buildSearchUrls(property), [property]);
  const mapsEmbedUrl = useMemo(() => getGoogleMapsEmbedUrl(property), [property]);
  
  if (!property) return null;

  const fullAddress = [
    property.situs_street_number,
    property.situs_street_name,
    property.situs_street_type
  ].filter(Boolean).join(' ');

  const QuickLink = ({ href, icon: Icon, label, color = "slate" }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] bg-${color}-50 border-${color}-200 text-${color}-700 hover:bg-${color}-100`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
    </a>
  );

  return (
    <div className="space-y-4">
      {/* REIPro - Premium - At the top for easy access */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            REIPro Analysis
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={urls.reipro}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all hover:shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white hover:from-amber-600 hover:to-orange-600"
          >
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-base">Open REIPro</span>
              <p className="text-xs text-amber-100">Full property analysis, comps & deal calculator</p>
            </div>
            <ExternalLink className="h-5 w-5 opacity-75" />
          </a>
          <p className="mt-2 text-xs text-amber-700 text-center">
            Search for: <span className="font-mono bg-amber-100 px-1 rounded">{fullAddress}</span>
          </p>
        </CardContent>
      </Card>

      {/* Property Image / Map Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              Property View
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={!showMap ? "default" : "outline"}
                onClick={() => setShowMap(false)}
                className="h-7 text-xs"
              >
                <Map className="h-3 w-3 mr-1" />
                Satellite
              </Button>
              <Button
                size="sm"
                variant={showMap ? "default" : "outline"}
                onClick={() => setShowMap(true)}
                className="h-7 text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Street
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full h-48 bg-slate-100 overflow-hidden rounded-b-lg">
            {!showMap ? (
              // Satellite/Map View
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property Map"
                className="absolute inset-0"
              />
            ) : (
              // Street View Link/Placeholder
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <Camera className="h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-3">View Street Level Photos</p>
                <Button
                  size="sm"
                  onClick={() => window.open(urls.googleStreetView, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Open Street View
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links - Property Listings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            Property Listings & Values
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <a
            href={urls.zillow}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Zillow</span>
              <p className="text-xs text-blue-600">Zestimate & Details</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.redfin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Redfin</span>
              <p className="text-xs text-red-600">Estimate & History</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.realtor}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <div className="h-6 w-6 rounded bg-orange-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Realtor.com</span>
              <p className="text-xs text-orange-600">Listings & Data</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.bcpa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          >
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">BCPA</span>
              <p className="text-xs text-emerald-600">Official Records</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </CardContent>
      </Card>

      {/* Schools Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            Nearby Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a
              href={urls.greatSchools}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 rounded-lg border transition-all hover:shadow-md bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">GreatSchools</span>
                <p className="text-xs text-purple-600">View ratings & reviews for schools near {property.situs_zip}</p>
              </div>
              <ExternalLink className="h-4 w-4 opacity-50" />
            </a>
            
            <a
              href={urls.niche}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 rounded-lg border transition-all hover:shadow-md bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            >
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Niche</span>
                <p className="text-xs text-indigo-600">School rankings & neighborhood grades</p>
              </div>
              <ExternalLink className="h-4 w-4 opacity-50" />
            </a>
          </div>
          
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">
              💡 <strong>Tip:</strong> Schools significantly impact property values. Properties in top-rated school districts typically command 10-20% higher prices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rental Estimates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Rental Estimates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <a
            href={urls.rentometer}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Rentometer</span>
              <p className="text-xs text-green-600">Rent Comps</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
          
          <a
            href={urls.zillow_rent}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all hover:shadow-md bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">Zillow Rentals</span>
              <p className="text-xs text-blue-600">Rent Zestimate</p>
            </div>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </CardContent>
      </Card>

      {/* Maps & Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-600" />
            Maps & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <a
            href={urls.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <Map className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Google Maps</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </a>
          
          <a
            href={urls.googleStreetView}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <Navigation className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Street View</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

