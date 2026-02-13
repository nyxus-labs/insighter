'use client';

import { useState, useEffect } from 'react';
import { environmentService, ToolStatus } from '@/lib/services/environmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Package, Terminal, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function SetupToolsPage() {
  const [status, setStatus] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [isVenv, setIsVenv] = useState<boolean | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [statusData, venvData] = await Promise.all([
        environmentService.getStatus(),
        environmentService.checkVenv()
      ]);
      setStatus(statusData);
      setIsVenv(venvData.is_venv);
    } catch (error) {
      console.error('Failed to fetch environment status:', error);
      toast.error('Could not connect to backend environment service');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const response = await environmentService.installDependencies();
      if (response.success) {
        toast.success('All tools installed successfully in .venv');
        await fetchStatus();
      } else {
        toast.error('Installation failed: ' + response.message);
        console.error('Install details:', response.details);
      }
    } catch (error) {
      toast.error('An unexpected error occurred during installation');
    } finally {
      setInstalling(false);
    }
  };

  const installedCount = status.filter(s => s.installed).length;
  const totalCount = status.length;
  const progress = totalCount > 0 ? (installedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Environment Setup</h1>
          <p className="text-muted-foreground">
            Configure your isolated development environment and install required tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                VENV Isolation
              </CardTitle>
              <CardDescription>
                Project environment isolation status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isVenv === null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isVenv ? (
                  <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                    Isolated (.venv active)
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Not Isolated (System Python)
                  </Badge>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                All packages will be installed in the project's <code>.venv</code> directory to prevent conflicts with system-wide installations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Package Status
              </CardTitle>
              <CardDescription>
                {installedCount} of {totalCount} required tools installed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Installation Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Button 
                onClick={handleInstall} 
                disabled={installing || progress === 100}
                className="w-full"
              >
                {installing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Installing Tools...
                  </>
                ) : progress === 100 ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Ready to Use
                  </>
                ) : (
                  <>
                    <Terminal className="mr-2 h-4 w-4" />
                    Install All Tools
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tool Inventory</CardTitle>
            <CardDescription>
              A list of all required packages from <code>requirements.txt</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {status.map((tool) => (
                  <div 
                    key={tool.name} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{tool.name}</span>
                      {tool.version && (
                        <span className="text-xs text-muted-foreground">v{tool.version}</span>
                      )}
                    </div>
                    {tool.installed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t p-6">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/tools'}>
              Continue to Tools Gallery
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
