import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Github, 
  Search, 
  Loader2, 
  Info, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { getPublicRepoStats } from "@/services/api";
import RepoDisplayComponent from "@/components/RepoDisplayComponent";

const PublicStats = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    
    setLoading(true);
    setError(null);
    setRepoData(null);

    try {
      const response = await getPublicRepoStats(repoUrl);
      setRepoData(response.data);
    } catch (err) {
      console.error('Error fetching repository stats:', err);
      if (err.response?.status === 429) {
        setError("GitHub API rate limit exceeded. Please try again later or consider authenticating for higher limits.");
      } else if (err.response?.status === 404) {
        setError("Repository not found. Please check the URL and try again.");
      } else if (err.response?.status === 403) {
        setError("Access forbidden. The repository might be private or you may have exceeded rate limits.");
      } else {
        setError(err.response?.data?.error || "Failed to fetch repository stats. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAnalyze();
    }
  };

  const handleExampleRepo = (url) => {
    setRepoUrl(url);
    setError(null);
  };

  // Check if we have enhanced analytics data
  const hasEnhancedAnalytics = repoData?.coreMetrics && Object.keys(repoData.coreMetrics).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Public Repository Analytics</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Enter any public GitHub repository URL to get comprehensive statistics and insights.
            </p>
            {hasEnhancedAnalytics && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Enhanced analytics available</span>
              </div>
            )}
          </div>

          {/* Input Section */}
          <Card className="mb-8 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <span>Repository URL</span>
              </CardTitle>
              <CardDescription>
                Paste a GitHub repository URL to analyze its statistics, contributor activity, code patterns, and team health metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading || !repoUrl.trim()}
                  variant="default"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              
              {/* Example repositories */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">Try these popular repositories:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "React", url: "https://github.com/facebook/react" },
                    { name: "Vue.js", url: "https://github.com/vuejs/vue" },
                    { name: "Next.js", url: "https://github.com/vercel/next.js" },
                    { name: "TypeScript", url: "https://github.com/microsoft/TypeScript" }
                  ].map((repo) => (
                    <Button
                      key={repo.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleRepo(repo.url)}
                      className="text-xs"
                    >
                      {repo.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Public repository analysis includes basic statistics, language breakdown, and contributor information. 
              {hasEnhancedAnalytics && " Enhanced analytics include contributor trends, code churn analysis, PR metrics, and issue management insights."}
              {!hasEnhancedAnalytics && repoData && " Some advanced analytics may be limited for public repositories due to API restrictions."}
            </AlertDescription>
          </Alert>

          {/* Loading State */}
          {loading && (
            <Card className="shadow-medium">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Analyzing Repository</h3>
                  <p className="text-muted-foreground mb-4">
                    Fetching repository data, analyzing code patterns, and calculating metrics...
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Basic Stats</Badge>
                    <Badge variant="outline">Language Analysis</Badge>
                    <Badge variant="outline">Contributor Data</Badge>
                    <Badge variant="outline">Advanced Metrics</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Analysis Failed</div>
                {error}
                {error.includes("rate limit") && (
                  <div className="mt-2 text-sm">
                    <p>GitHub API has usage limits for unauthenticated requests. You can:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Wait a few minutes and try again</li>
                      <li>Try a different repository</li>
                      <li>Create an account for higher limits</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success State with Enhanced Data */}
          {repoData && !error && (
            <div className="space-y-6">
              {/* Enhanced Analytics Badge */}
              {hasEnhancedAnalytics && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="font-semibold mb-1">Enhanced Analytics Available!</div>
                    This analysis includes advanced metrics like contributor trends, code churn patterns, 
                    pull request analytics, and issue management insights.
                  </AlertDescription>
                </Alert>
              )}

              {/* Repository Link */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Github className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{repoData.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(repoData.createdAt).toLocaleDateString()}
                          {repoData.updatedAt && ` • Updated ${new Date(repoData.updatedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={repoData.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on GitHub
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Main Repository Display */}
              <RepoDisplayComponent data={repoData} />

              {/* Analysis Summary */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Analysis Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Repository Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Stars</span>
                          <span className="font-medium">{repoData.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Forks</span>
                          <span className="font-medium">{repoData.forks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contributors</span>
                          <span className="font-medium">{repoData.contributors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Primary Language</span>
                          <span className="font-medium">{repoData.primaryLanguage || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Code Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Lines</span>
                          <span className="font-medium">{repoData.totalLines.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Languages</span>
                          <span className="font-medium">{Object.keys(repoData.languages).length}</span>
                        </div>
                        {hasEnhancedAnalytics && (
                          <>
                            <div className="flex justify-between">
                              <span>Active Contributors (30d)</span>
                              <span className="font-medium">
                                {repoData.coreMetrics?.activeContributorTrend?.totalActiveContributors || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Code Churn</span>
                              <span className="font-medium">
                                {repoData.coreMetrics?.codeChurn?.avgChurnPerCommit || 0}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {hasEnhancedAnalytics && (
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Advanced analytics successfully loaded - explore the tabs above for detailed insights!
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicStats;