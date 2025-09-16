import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUp, Calculator, Map, BarChart3, Download, Droplets } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import DataUpload from "./DataUpload";
import CalculationEngine from "./CalculationEngine";
import ResultsVisualization from "./ResultsVisualization";
import GeospatialMap from "./GeospatialMap";

export interface WaterSample {
  id: string;
  latitude: number;
  longitude: number;
  sampleDate: string;
  metals: {
    As: number; // Arsenic
    Cd: number; // Cadmium
    Cr: number; // Chromium
    Cu: number; // Copper
    Fe: number; // Iron
    Mn: number; // Manganese
    Ni: number; // Nickel
    Pb: number; // Lead
    Zn: number; // Zinc
  };
  hmpiResults?: {
    hpi: number;
    pli: number;
    cf: number;
    qualityCategory: 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable';
  };
}

const Dashboard = () => {
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [activeTab, setActiveTab] = useState("upload");

  const handleDataUploaded = (newSamples: WaterSample[]) => {
    setSamples(newSamples);
    setActiveTab("calculate");
  };

  const handleCalculationComplete = (calculatedSamples: WaterSample[]) => {
    setSamples(calculatedSamples);
    setActiveTab("results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Environmental monitoring and water quality assessment"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
        </div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                <Droplets className="h-8 w-8" />
              </div>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Environmental Assessment
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Heavy Metal Pollution Index
              <span className="block text-3xl font-medium text-primary-foreground/90 mt-2">
                Automated Groundwater Assessment
              </span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl leading-relaxed">
              Advanced computational tool for automated calculation of heavy metal pollution indices 
              in groundwater samples with interactive visualization and geospatial analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setActiveTab("upload")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Start Analysis
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Analysis Dashboard</h2>
              <p className="text-muted-foreground">
                Upload data, calculate indices, and visualize pollution patterns
              </p>
            </div>
            {samples.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm px-4 py-2">
                  {samples.length} Samples Loaded
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Data Upload
              </TabsTrigger>
              <TabsTrigger value="calculate" className="flex items-center gap-2" disabled={samples.length === 0}>
                <Calculator className="h-4 w-4" />
                Calculate
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!samples.some(s => s.hmpiResults)}>
                <BarChart3 className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2" disabled={!samples.some(s => s.hmpiResults)}>
                <Map className="h-4 w-4" />
                Geospatial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-8">
              <DataUpload onDataUploaded={handleDataUploaded} />
            </TabsContent>

            <TabsContent value="calculate" className="mt-8">
              <CalculationEngine 
                samples={samples} 
                onCalculationComplete={handleCalculationComplete}
              />
            </TabsContent>

            <TabsContent value="results" className="mt-8">
              <ResultsVisualization samples={samples} />
            </TabsContent>

            <TabsContent value="map" className="mt-8">
              <GeospatialMap samples={samples} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Assessment Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced tools for environmental scientists and researchers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-lg w-fit mb-4">
                  <Calculator className="h-6 w-6" />
                </div>
                <CardTitle>Multiple Indices</CardTitle>
                <CardDescription>
                  HPI, PLI, CF, and more pollution assessment methods
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-accent to-primary text-primary-foreground rounded-lg w-fit mb-4">
                  <Map className="h-6 w-6" />
                </div>
                <CardTitle>Geospatial Analysis</CardTitle>
                <CardDescription>
                  Interactive maps with pollution hotspot identification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Rich Visualizations</CardTitle>
                <CardDescription>
                  Dynamic charts and comprehensive reporting tools
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;