import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Play, CheckCircle, Info, Settings } from "lucide-react";
import { WaterSample } from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

interface CalculationEngineProps {
  samples: WaterSample[];
  onCalculationComplete: (calculatedSamples: WaterSample[]) => void;
}

// WHO/EPA Standard values for heavy metals in drinking water (mg/L)
const WHO_STANDARDS = {
  As: 0.01,   // Arsenic
  Cd: 0.003,  // Cadmium
  Cr: 0.05,   // Chromium
  Cu: 2.0,    // Copper
  Fe: 0.3,    // Iron
  Mn: 0.1,    // Manganese
  Ni: 0.07,   // Nickel
  Pb: 0.01,   // Lead
  Zn: 3.0     // Zinc
};

const METAL_WEIGHTS = {
  As: 1.0,
  Cd: 1.0,
  Cr: 1.0,
  Cu: 1.0,
  Fe: 1.0,
  Mn: 1.0,
  Ni: 1.0,
  Pb: 1.0,
  Zn: 1.0
};

const CalculationEngine = ({ samples, onCalculationComplete }: CalculationEngineProps) => {
  const [selectedIndices, setSelectedIndices] = useState({
    hpi: true,
    pli: true,
    cf: false,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const availableIndices = [
    {
      id: 'hpi',
      name: 'Heavy Metal Pollution Index (HPI)',
      description: 'Composite index rating the overall quality of water',
      recommended: true
    },
    {
      id: 'pli',
      name: 'Pollution Load Index (PLI)',
      description: 'Provides comparative means for assessing the degree of heavy metal pollution',
      recommended: true
    },
    {
      id: 'cf',
      name: 'Contamination Factor (CF)',
      description: 'Compares current and pre-industrial metal concentrations',
      recommended: false
    }
  ];

  const calculateHPI = (metals: any): number => {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(metals).forEach(([metal, concentration]) => {
      const standard = WHO_STANDARDS[metal as keyof typeof WHO_STANDARDS];
      const weight = METAL_WEIGHTS[metal as keyof typeof METAL_WEIGHTS];
      
      if (standard && weight) {
        const subIndex = (concentration as number / standard) * 100;
        weightedSum += weight * subIndex;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const calculatePLI = (metals: any): number => {
    let product = 1;
    let count = 0;

    Object.entries(metals).forEach(([metal, concentration]) => {
      const standard = WHO_STANDARDS[metal as keyof typeof WHO_STANDARDS];
      if (standard) {
        const cf = (concentration as number) / standard;
        product *= cf;
        count++;
      }
    });

    return count > 0 ? Math.pow(product, 1 / count) : 0;
  };

  const calculateCF = (metals: any): number => {
    let totalCF = 0;
    let count = 0;

    Object.entries(metals).forEach(([metal, concentration]) => {
      const standard = WHO_STANDARDS[metal as keyof typeof WHO_STANDARDS];
      if (standard) {
        totalCF += (concentration as number) / standard;
        count++;
      }
    });

    return count > 0 ? totalCF / count : 0;
  };

  const categorizeWaterQuality = (hpi: number, pli: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable' => {
    if (hpi < 25 && pli < 1) return 'excellent';
    if (hpi < 50 && pli < 2) return 'good';
    if (hpi < 75 && pli < 3) return 'moderate';
    if (hpi < 100 && pli < 5) return 'poor';
    return 'unsuitable';
  };

  const performCalculations = async () => {
    setIsCalculating(true);
    setProgress(0);

    const calculatedSamples = samples.map((sample, index) => {
      // Simulate processing time
      setTimeout(() => {
        setProgress((index + 1) / samples.length * 100);
      }, index * 50);

      const hpi = selectedIndices.hpi ? calculateHPI(sample.metals) : 0;
      const pli = selectedIndices.pli ? calculatePLI(sample.metals) : 0;
      const cf = selectedIndices.cf ? calculateCF(sample.metals) : 0;
      
      const qualityCategory = categorizeWaterQuality(hpi, pli);

      return {
        ...sample,
        hmpiResults: {
          hpi,
          pli,
          cf,
          qualityCategory
        }
      };
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsCalculating(false);
    setProgress(100);
    
    onCalculationComplete(calculatedSamples);
    
    toast({
      title: "Calculations completed",
      description: `Successfully processed ${samples.length} samples`,
    });
  };

  const handleIndexToggle = (indexId: string, checked: boolean) => {
    setSelectedIndices(prev => ({
      ...prev,
      [indexId]: checked
    }));
  };

  const selectedCount = Object.values(selectedIndices).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculation Configuration
          </CardTitle>
          <CardDescription>
            Select the pollution indices to calculate for your water samples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Index Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Available Indices</Label>
            </div>
            
            {availableIndices.map((index) => (
              <div key={index.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={index.id}
                  checked={selectedIndices[index.id as keyof typeof selectedIndices]}
                  onCheckedChange={(checked) => handleIndexToggle(index.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={index.id} className="text-sm font-medium cursor-pointer">
                      {index.name}
                    </Label>
                    {index.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {index.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sample Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div><strong>Samples to process:</strong> {samples.length}</div>
                <div><strong>Selected indices:</strong> {selectedCount}</div>
                <div><strong>Standards:</strong> WHO/EPA drinking water guidelines</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Calculation Progress */}
          {isCalculating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Processing samples...</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={performCalculations}
              disabled={isCalculating || selectedCount === 0}
              size="lg"
              className="flex-1"
            >
              {isCalculating ? (
                <>Processing...</>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Calculate Indices
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Method Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculation Methods</CardTitle>
          <CardDescription>
            Overview of the pollution index calculation methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Heavy Metal Pollution Index (HPI)</h4>
              <p className="text-sm text-muted-foreground">
                HPI = Σ(Wi × Qi) / ΣWi, where Wi is the weight and Qi is the quality rating
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Pollution Load Index (PLI)</h4>
              <p className="text-sm text-muted-foreground">
                PLI = (CF1 × CF2 × ... × CFn)^(1/n), where CF is contamination factor
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Quality Categories</h4>
            <div className="grid grid-cols-5 gap-2 text-sm">
              <Badge className="bg-excellent text-excellent-foreground">Excellent</Badge>
              <Badge className="bg-good text-good-foreground">Good</Badge>
              <Badge className="bg-moderate text-moderate-foreground">Moderate</Badge>
              <Badge className="bg-poor text-poor-foreground">Poor</Badge>
              <Badge className="bg-unsuitable text-unsuitable-foreground">Unsuitable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculationEngine;