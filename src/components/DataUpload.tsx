import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import Papa from 'papaparse';
import { WaterSample } from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

interface DataUploadProps {
  onDataUploaded: (samples: WaterSample[]) => void;
}

const DataUpload = ({ onDataUploaded }: DataUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<WaterSample[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const requiredColumns = ['latitude', 'longitude', 'sampleDate', 'As', 'Cd', 'Cr', 'Cu', 'Fe', 'Mn', 'Ni', 'Pb', 'Zn'];

  const validateData = (data: any[]): { isValid: boolean; errors: string[]; samples: WaterSample[] } => {
    const errors: string[] = [];
    const samples: WaterSample[] = [];

    if (data.length === 0) {
      errors.push("No data found in the uploaded file");
      return { isValid: false, errors, samples };
    }

    // Check required columns
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Check latitude and longitude
      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        rowErrors.push(`Invalid latitude at row ${index + 1}`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        rowErrors.push(`Invalid longitude at row ${index + 1}`);
      }

      // Check metal concentrations
      const metals = ['As', 'Cd', 'Cr', 'Cu', 'Fe', 'Mn', 'Ni', 'Pb', 'Zn'];
      const metalValues: any = {};
      
      metals.forEach(metal => {
        const value = parseFloat(row[metal]);
        if (isNaN(value) || value < 0) {
          rowErrors.push(`Invalid ${metal} concentration at row ${index + 1}`);
        } else {
          metalValues[metal] = value;
        }
      });

      if (rowErrors.length === 0) {
        samples.push({
          id: `sample_${index + 1}`,
          latitude: lat,
          longitude: lng,
          sampleDate: row.sampleDate || new Date().toISOString().split('T')[0],
          metals: metalValues
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      samples
    };
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUploadProgress(50);
        
        const validation = validateData(results.data);
        
        if (validation.isValid) {
          setPreviewData(validation.samples);
          setUploadProgress(100);
          toast({
            title: "Data uploaded successfully",
            description: `${validation.samples.length} samples ready for analysis`,
          });
        } else {
          setErrors(validation.errors);
          toast({
            title: "Upload failed",
            description: "Please check the data format and try again",
            variant: "destructive",
          });
        }
        
        setIsProcessing(false);
      },
      error: (error) => {
        setErrors([`File parsing error: ${error.message}`]);
        setIsProcessing(false);
        toast({
          title: "Upload failed",
          description: "Could not parse the CSV file",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handleConfirmUpload = () => {
    onDataUploaded(previewData);
    toast({
      title: "Data confirmed",
      description: "Proceeding to calculation step",
    });
  };

  const clearData = () => {
    setPreviewData([]);
    setErrors([]);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Data Upload
          </CardTitle>
          <CardDescription>
            Upload your groundwater heavy metal concentration data in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-medium">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground">
                Choose a file containing water sample data with heavy metal concentrations
              </p>
            </div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="max-w-xs mx-auto"
            />
          </div>

          {/* Required Format */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> latitude, longitude, sampleDate, As, Cd, Cr, Cu, Fe, Mn, Ni, Pb, Zn
              <br />
              <strong>Format:</strong> Coordinates in decimal degrees, metal concentrations in mg/L
            </AlertDescription>
          </Alert>

          {/* Upload Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Label>Processing file...</Label>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Upload Errors:</strong>
                <ul className="mt-2 space-y-1">
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-sm">• ... and {errors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                  <CardDescription>
                    {previewData.length} samples ready for analysis
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearData}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={handleConfirmUpload}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sample ID</TableHead>
                        <TableHead>Coordinates</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>As</TableHead>
                        <TableHead>Cd</TableHead>
                        <TableHead>Cr</TableHead>
                        <TableHead>Cu</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 5).map((sample) => (
                        <TableRow key={sample.id}>
                          <TableCell className="font-medium">{sample.id}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{sample.latitude.toFixed(4)}</div>
                              <div className="text-muted-foreground">{sample.longitude.toFixed(4)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{sample.sampleDate}</TableCell>
                          <TableCell>{sample.metals.As.toFixed(3)}</TableCell>
                          <TableCell>{sample.metals.Cd.toFixed(3)}</TableCell>
                          <TableCell>{sample.metals.Cr.toFixed(3)}</TableCell>
                          <TableCell>{sample.metals.Cu.toFixed(3)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-success border-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {previewData.length > 5 && (
                    <div className="p-4 text-center text-sm text-muted-foreground border-t">
                      ... and {previewData.length - 5} more samples
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;