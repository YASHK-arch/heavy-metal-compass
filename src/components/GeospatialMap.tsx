import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Layers, Download, Info } from "lucide-react";
import { WaterSample } from "./Dashboard";

// Note: For a full implementation, you would use react-leaflet
// This is a simplified version showing the structure

interface GeospatialMapProps {
  samples: WaterSample[];
}

const GeospatialMap = ({ samples }: GeospatialMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const processedSamples = samples.filter(s => s.hmpiResults);

  const qualityStats = processedSamples.reduce((acc, sample) => {
    const category = sample.hmpiResults!.qualityCategory;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Placeholder for map initialization
  useEffect(() => {
    if (mapRef.current && processedSamples.length > 0) {
      // Here you would initialize the Leaflet map
      // map = L.map(mapRef.current).setView([centerLat, centerLng], 10);
      // Add markers for each sample with color coding based on quality
    }
  }, [processedSamples]);

  if (processedSamples.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No geospatial data available</p>
            <p className="text-sm text-muted-foreground">Complete the calculation step to view map</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geospatial Analysis</h2>
          <p className="text-muted-foreground">Interactive pollution hotspot mapping</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Map
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Pollution Distribution Map
              </CardTitle>
              <CardDescription>
                Interactive map showing water quality assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder Map - In a real implementation, this would be a Leaflet map */}
              <div 
                ref={mapRef} 
                className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border flex items-center justify-center relative overflow-hidden"
              >
                {/* Simulated map interface */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-green-100/50">
                  {/* Simulated sample points */}
                  {processedSamples.slice(0, 8).map((sample, index) => (
                    <div
                      key={sample.id}
                      className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
                        sample.hmpiResults!.qualityCategory === 'excellent' ? 'bg-excellent' :
                        sample.hmpiResults!.qualityCategory === 'good' ? 'bg-good' :
                        sample.hmpiResults!.qualityCategory === 'moderate' ? 'bg-moderate' :
                        sample.hmpiResults!.qualityCategory === 'poor' ? 'bg-poor' :
                        'bg-unsuitable'
                      }`}
                      style={{
                        left: `${20 + (index % 4) * 20}%`,
                        top: `${30 + Math.floor(index / 4) * 30}%`
                      }}
                      title={`${sample.id}: ${sample.hmpiResults!.qualityCategory}`}
                    />
                  ))}
                </div>
                
                <div className="text-center space-y-2 z-10">
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">Interactive Map Preview</h3>
                    <p className="text-sm text-gray-600">
                      Full Leaflet integration would display detailed interactive map here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Legend and Statistics */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-excellent border"></div>
                <span className="text-sm">Excellent ({qualityStats.excellent || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-good border"></div>
                <span className="text-sm">Good ({qualityStats.good || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-moderate border"></div>
                <span className="text-sm">Moderate ({qualityStats.moderate || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-poor border"></div>
                <span className="text-sm">Poor ({qualityStats.poor || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-unsuitable border"></div>
                <span className="text-sm">Unsuitable ({qualityStats.unsuitable || 0})</span>
              </div>
            </CardContent>
          </Card>

          {/* Spatial Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spatial Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sample Points</span>
                  <Badge variant="outline">{processedSamples.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coverage Area</span>
                  <Badge variant="outline">Regional</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hotspots</span>
                  <Badge variant="destructive">
                    {(qualityStats.poor || 0) + (qualityStats.unsuitable || 0)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Interactive Features:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Click markers for detailed information</li>
                <li>• Toggle layers for different views</li>
                <li>• Export high-resolution maps</li>
                <li>• Generate spatial reports</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Hotspot Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Pollution Hotspot Analysis</CardTitle>
          <CardDescription>
            Areas requiring immediate attention based on HMPI calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedSamples
              .filter(s => s.hmpiResults!.qualityCategory === 'poor' || s.hmpiResults!.qualityCategory === 'unsuitable')
              .slice(0, 6)
              .map((sample) => (
                <div key={sample.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{sample.id}</h4>
                    <Badge 
                      className={
                        sample.hmpiResults!.qualityCategory === 'poor' ? 'bg-poor text-poor-foreground' :
                        'bg-unsuitable text-unsuitable-foreground'
                      }
                    >
                      {sample.hmpiResults!.qualityCategory}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Lat: {sample.latitude.toFixed(4)}</div>
                    <div>Lng: {sample.longitude.toFixed(4)}</div>
                  </div>
                  <div className="text-sm">
                    <div>HPI: <span className="font-medium">{sample.hmpiResults!.hpi.toFixed(1)}</span></div>
                    <div>PLI: <span className="font-medium">{sample.hmpiResults!.pli.toFixed(2)}</span></div>
                  </div>
                </div>
              ))}
          </div>
          
          {processedSamples.filter(s => s.hmpiResults!.qualityCategory === 'poor' || s.hmpiResults!.qualityCategory === 'unsuitable').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Badge variant="secondary" className="bg-excellent text-excellent-foreground">
                No critical hotspots detected
              </Badge>
              <p className="mt-2 text-sm">All samples show acceptable water quality levels</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeospatialMap;