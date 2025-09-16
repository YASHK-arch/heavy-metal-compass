import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Download, Filter, BarChart3 } from "lucide-react";
import { WaterSample } from "./Dashboard";

interface ResultsVisualizationProps {
  samples: WaterSample[];
}

const QUALITY_COLORS = {
  excellent: 'hsl(var(--excellent))',
  good: 'hsl(var(--good))',
  moderate: 'hsl(var(--moderate))',
  poor: 'hsl(var(--poor))',
  unsuitable: 'hsl(var(--unsuitable))'
};

const ResultsVisualization = ({ samples }: ResultsVisualizationProps) => {
  const processedSamples = samples.filter(s => s.hmpiResults);

  const statisticsData = useMemo(() => {
    const hpiValues = processedSamples.map(s => s.hmpiResults!.hpi);
    const pliValues = processedSamples.map(s => s.hmpiResults!.pli);
    
    return {
      hpi: {
        min: Math.min(...hpiValues),
        max: Math.max(...hpiValues),
        avg: hpiValues.reduce((a, b) => a + b, 0) / hpiValues.length,
      },
      pli: {
        min: Math.min(...pliValues),
        max: Math.max(...pliValues),
        avg: pliValues.reduce((a, b) => a + b, 0) / pliValues.length,
      }
    };
  }, [processedSamples]);

  const qualityDistribution = useMemo(() => {
    const distribution = processedSamples.reduce((acc, sample) => {
      const category = sample.hmpiResults!.qualityCategory;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: (count / processedSamples.length * 100).toFixed(1),
      color: QUALITY_COLORS[category as keyof typeof QUALITY_COLORS]
    }));
  }, [processedSamples]);

  const chartData = useMemo(() => {
    return processedSamples.slice(0, 10).map((sample, index) => ({
      id: `Sample ${index + 1}`,
      hpi: Math.round(sample.hmpiResults!.hpi * 100) / 100,
      pli: Math.round(sample.hmpiResults!.pli * 100) / 100,
      category: sample.hmpiResults!.qualityCategory
    }));
  }, [processedSamples]);

  const metalContributionData = useMemo(() => {
    const metals = ['As', 'Cd', 'Cr', 'Cu', 'Fe', 'Mn', 'Ni', 'Pb', 'Zn'];
    return metals.map(metal => {
      const avgConcentration = processedSamples.reduce((sum, sample) => {
        return sum + sample.metals[metal as keyof typeof sample.metals];
      }, 0) / processedSamples.length;
      
      return {
        metal,
        concentration: Math.round(avgConcentration * 1000) / 1000,
        name: metal === 'As' ? 'Arsenic' : 
              metal === 'Cd' ? 'Cadmium' : 
              metal === 'Cr' ? 'Chromium' : 
              metal === 'Cu' ? 'Copper' : 
              metal === 'Fe' ? 'Iron' : 
              metal === 'Mn' ? 'Manganese' : 
              metal === 'Ni' ? 'Nickel' : 
              metal === 'Pb' ? 'Lead' : 'Zinc'
      };
    });
  }, [processedSamples]);

  if (processedSamples.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No calculation results available</p>
            <p className="text-sm text-muted-foreground">Complete the calculation step to view results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Samples</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">
              {processedSamples.length}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average HPI</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent">
              {statisticsData.hpi.avg.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">   
            <CardDescription>Average PLI</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent">
              {statisticsData.pli.avg.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quality Status</CardDescription>
            <CardTitle className="text-lg">
              <Badge 
                className={`${
                  qualityDistribution[0]?.category === 'Excellent' ? 'bg-excellent text-excellent-foreground' :
                  qualityDistribution[0]?.category === 'Good' ? 'bg-good text-good-foreground' :
                  qualityDistribution[0]?.category === 'Moderate' ? 'bg-moderate text-moderate-foreground' :
                  qualityDistribution[0]?.category === 'Poor' ? 'bg-poor text-poor-foreground' :
                  'bg-unsuitable text-unsuitable-foreground'
                }`}
              >
                Most: {qualityDistribution[0]?.category}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quality Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Water Quality Distribution</CardTitle>
            <CardDescription>
              Breakdown of samples by quality category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} samples`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HPI vs PLI Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Pollution Index Comparison</CardTitle>
            <CardDescription>
              HPI and PLI values for top 10 samples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hpi" fill="hsl(var(--primary))" name="HPI" />
                <Bar dataKey="pli" fill="hsl(var(--accent))" name="PLI" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Metal Concentrations Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Heavy Metal Concentrations</CardTitle>
          <CardDescription>
            Mean concentration levels across all samples (mg/L)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metalContributionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip 
                formatter={(value, name) => [`${value} mg/L`, 'Concentration']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="concentration" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>
              Complete analysis results for all samples
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>HPI</TableHead>
                  <TableHead>PLI</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Key Pollutants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedSamples.slice(0, 10).map((sample) => {
                  const topPollutants = Object.entries(sample.metals)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 2)
                    .map(([metal]) => metal);

                  return (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium">{sample.id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{sample.latitude.toFixed(4)}</div>
                          <div className="text-muted-foreground">{sample.longitude.toFixed(4)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{sample.hmpiResults!.hpi.toFixed(1)}</span>
                          {sample.hmpiResults!.hpi > 75 && (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{sample.hmpiResults!.pli.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${
                            sample.hmpiResults!.qualityCategory === 'excellent' ? 'bg-excellent text-excellent-foreground' :
                            sample.hmpiResults!.qualityCategory === 'good' ? 'bg-good text-good-foreground' :
                            sample.hmpiResults!.qualityCategory === 'moderate' ? 'bg-moderate text-moderate-foreground' :
                            sample.hmpiResults!.qualityCategory === 'poor' ? 'bg-poor text-poor-foreground' :
                            'bg-unsuitable text-unsuitable-foreground'
                          }`}
                        >
                          {sample.hmpiResults!.qualityCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {topPollutants.map(metal => (
                            <Badge key={metal} variant="outline" className="text-xs">
                              {metal}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {processedSamples.length > 10 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                Showing 10 of {processedSamples.length} samples
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsVisualization;