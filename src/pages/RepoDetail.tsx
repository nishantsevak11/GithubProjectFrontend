import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { getPrivateRepoStats, getTeamHealth } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Github,
  Star,
  GitFork,
  Code,
  GitBranch,
  Users,
  Calendar,
  ExternalLink,
  ArrowLeft,
  GitCommit,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  GitPullRequest,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface LanguageDetail {
  files: number;
  lines: number;
  bytes: number;
}

interface CoreMetrics {
  activeContributorTrend: {
    totalActiveContributors: number;
    avgCommitsPerContributor: number;
    avgDailyActiveContributors: number;
    contributorDetails: Array<{
      name: string;
      commits: number;
      activeDays: number;
    }>;
  };
  codeChurn: {
    totalAdditions: number;
    totalDeletions: number;
    avgChurnPerCommit: number;
    weeklyChurn: Array<{
      week: string;
      additions: number;
      deletions: number;
      churnRate: number;
      commits: number;
    }>;
    recentCommits: Array<{
      date: string;
      additions: number;
      deletions: number;
      total: number;
      message: string;
      author: string;
    }>;
  };
  pullRequestAnalytics: {
    avgPullRequestLifetime: number;
    avgTimeToFirstReview: number | null;
    totalAnalyzedPRs: number;
    prsWithReviews: number;
    prDetails: Array<{
      number: number;
      title: string;
      lifetime: number;
      timeToFirstReview: number | null;
      reviewCount: number;
      commentCount: number;
      merged: boolean;
      author: string;
    }>;
  };
  issueManagement: {
    totalIssues: number;
    closedIssues: number;
    openIssues: number;
    closureRate: number;
    avgResolutionTime: number;
    recentClosedIssues: Array<{
      number: number;
      title: string;
      resolutionTime: number;
      labels: string[];
      author: string;
    }>;
  };
}

interface TeamHealth {
  healthScore: number;
  status: string;
  statusColor: string;
  factors: Array<{
    factor: string;
    impact: number;
    recommendation: string;
  }>;
  metrics: CoreMetrics;
  recommendations: string[];
  lastUpdated: string;
}

interface ApiRepoStats {
  repository: {
    name: string;
    fullName: string;
    description: string | null;
    isPrivate: boolean;
    url: string;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    stars: number;
    forks: number;
    size: number;
    openIssues: number;
  };
  languages: { [key: string]: LanguageDetail };
  totalLines: number;
  recentCommits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
  contributors: Array<{
    username: string;
    avatar: string;
    contributions: number;
  }>;
  branches: Array<{
    name: string;
    protected: boolean;
  }>;
  coreMetrics: CoreMetrics;
}

const RepoDetail = () => {
  const { repoName } = useParams<{ repoName: string }>();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [repoStats, setRepoStats] = useState<ApiRepoStats | null>(null);
  const [teamHealth, setTeamHealth] = useState<TeamHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchRepoData = async () => {
      if (!repoName || isAuthLoading || !user) return;
      
      setLoading(true);
      try {
        const [repoResponse, healthResponse] = await Promise.allSettled([
          getPrivateRepoStats(repoName),
          getTeamHealth(user.username, repoName)
        ]);

        if (repoResponse.status === 'fulfilled') {
          setRepoStats(repoResponse.value.data);
        }

        if (healthResponse.status === 'fulfilled') {
          setTeamHealth(healthResponse.value.data);
        }

      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch repository data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRepoData();
    }
  }, [repoName, isAuthenticated, isAuthLoading, user]);

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !repoStats) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error || 'Repository not found'}</p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Process data for charts
  const languageData = Object.entries(repoStats.languages || {}).map(([name, langStats]) => ({
    name,
    lines: langStats.lines,
    percentage: repoStats.totalLines > 0 ? (langStats.lines / repoStats.totalLines) * 100 : 0,
    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
  }));

  const commits = Array.isArray(repoStats.recentCommits) ? repoStats.recentCommits : [];
  const contributors = Array.isArray(repoStats.contributors) ? repoStats.contributors : [];
  const branches = Array.isArray(repoStats.branches) ? repoStats.branches : [];

  // Process core metrics data
  const contributorTrendData = repoStats.coreMetrics?.activeContributorTrend?.contributorDetails || [];
  const weeklyChurnData = repoStats.coreMetrics?.codeChurn?.weeklyChurn || [];
  const prAnalytics = repoStats.coreMetrics?.pullRequestAnalytics || {};
  const issueMetrics = repoStats.coreMetrics?.issueManagement || {};

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gradient">{repoStats.repository.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {repoStats.repository.isPrivate && <Badge variant="secondary">Private</Badge>}
              <Button variant="outline" size="sm" asChild>
                <a href={repoStats.repository.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Team Health Score */}
          {teamHealth && (
            <Card className="shadow-elegant border-l-4" style={{ borderLeftColor: teamHealth.statusColor }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Team Health Score</span>
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className="text-sm font-semibold"
                    style={{ color: teamHealth.statusColor, borderColor: teamHealth.statusColor }}
                  >
                    {teamHealth.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold" style={{ color: teamHealth.statusColor }}>
                      {teamHealth.healthScore}
                    </div>
                    <div className="flex-1">
                      <Progress value={teamHealth.healthScore} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Overall team productivity and collaboration health
                      </p>
                    </div>
                  </div>
                  
                  {teamHealth.factors.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                          Areas for Improvement
                        </h4>
                        <div className="space-y-2">
                          {teamHealth.factors.slice(0, 3).map((factor, index) => (
                            <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                              <div className="font-medium text-destructive">{factor.factor}</div>
                              <div className="text-xs text-muted-foreground">{factor.recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Key Recommendations
                        </h4>
                        <div className="space-y-2">
                          {teamHealth.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contributors">Contributors</TabsTrigger>
              <TabsTrigger value="code-activity">Code Activity</TabsTrigger>
              <TabsTrigger value="prs">Pull Requests</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Repository Overview */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Github className="w-5 h-5" />
                    <span>{repoStats.repository.fullName}</span>
                  </CardTitle>
                  {repoStats.repository.description && (
                    <CardDescription className="text-base">{repoStats.repository.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold">{repoStats.stats.stars}</div>
                      <div className="text-sm text-muted-foreground">Stars</div>
                    </div>
                    <div className="text-center">
                      <GitFork className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{repoStats.stats.forks}</div>
                      <div className="text-sm text-muted-foreground">Forks</div>
                    </div>
                    <div className="text-center">
                      <GitCommit className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{commits.length}</div>
                      <div className="text-sm text-muted-foreground">Recent Commits</div>
                    </div>
                    <div className="text-center">
                      <GitBranch className="w-8 h-8 text-success mx-auto mb-2" />
                      <div className="text-2xl font-bold">{branches.length}</div>
                      <div className="text-sm text-muted-foreground">Branches</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Distribution and Repository Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Language Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={languageData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={100} 
                            paddingAngle={2} 
                            dataKey="percentage"
                          >
                            {languageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {languageData.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                            <span className="text-sm">{lang.name}</span>
                          </div>
                          <Badge variant="outline">{lang.percentage.toFixed(1)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Repository Info */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Repository Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Size</div>
                      <div className="text-lg font-semibold">{Math.round(repoStats.stats.size / 1024)} MB</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Lines</div>
                      <div className="text-lg font-semibold">{repoStats.totalLines.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Open Issues</div>
                      <div className="text-lg font-semibold">{repoStats.stats.openIssues}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="text-lg font-semibold">{new Date(repoStats.repository.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Push</div>
                      <div className="text-lg font-semibold">{new Date(repoStats.repository.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contributors Tab */}
            <TabsContent value="contributors" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contributor Activity Chart */}
                {contributorTrendData.length > 0 && (
                  <Card className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Active Contributors (30 days)</span>
                      </CardTitle>
                      <CardDescription>
                        Commits and active days per contributor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={contributorTrendData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="commits" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {repoStats.coreMetrics?.activeContributorTrend && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-lg font-bold">{repoStats.coreMetrics.activeContributorTrend.totalActiveContributors}</div>
                            <div className="text-xs text-muted-foreground">Total Active</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{repoStats.coreMetrics.activeContributorTrend.avgCommitsPerContributor}</div>
                            <div className="text-xs text-muted-foreground">Avg Commits</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{repoStats.coreMetrics.activeContributorTrend.avgDailyActiveContributors}</div>
                            <div className="text-xs text-muted-foreground">Avg Daily Active</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Top Contributors */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Top Contributors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contributors.slice(0, 8).map((contributor) => (
                        <div key={contributor.username} className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={contributor.avatar} alt={contributor.username} />
                            <AvatarFallback>{contributor.username?.charAt(0) ?? '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{contributor.username}</div>
                            <div className="text-xs text-muted-foreground">{contributor.contributions} contributions</div>
                          </div>
                          <Badge variant="secondary">{contributor.contributions}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Code Activity Tab */}
            <TabsContent value="code-activity" className="space-y-6">
              {/* Weekly Code Churn */}
              {weeklyChurnData.length > 0 && (
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Code Churn Trend</span>
                    </CardTitle>
                    <CardDescription>
                      Code additions and deletions over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyChurnData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="additions" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="deletions" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {repoStats.coreMetrics?.codeChurn && (
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">+{repoStats.coreMetrics.codeChurn.totalAdditions}</div>
                          <div className="text-xs text-muted-foreground">Total Additions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">-{repoStats.coreMetrics.codeChurn.totalDeletions}</div>
                          <div className="text-xs text-muted-foreground">Total Deletions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{repoStats.coreMetrics.codeChurn.avgChurnPerCommit}</div>
                          <div className="text-xs text-muted-foreground">Avg Churn/Commit</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Commits */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitCommit className="w-5 h-5" />
                    <span>Recent Commits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commits.slice(0, 10).map((commit) => (
                      <div key={commit.sha} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{commit.author?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{commit.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{commit.author ?? 'Unknown'}</span>
                            <span>{new Date(commit.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pull Requests Tab */}
            <TabsContent value="prs" className="space-y-6">
              {prAnalytics.prDetails && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* PR Metrics */}
                  <Card className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GitPullRequest className="w-5 h-5" />
                        <span>PR Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Avg PR Lifetime</div>
                        <div className="text-2xl font-bold">{prAnalytics.avgPullRequestLifetime || 0} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Time to First Review</div>
                        <div className="text-2xl font-bold">
                          {prAnalytics.avgTimeToFirstReview ? `${prAnalytics.avgTimeToFirstReview}h` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">PRs with Reviews</div>
                        <div className="text-2xl font-bold">{prAnalytics.prsWithReviews || 0}/{prAnalytics.totalAnalyzedPRs || 0}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent PRs */}
                  <Card className="shadow-medium lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>Recent Pull Requests</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {prAnalytics.prDetails?.slice(0, 10).map((pr) => (
                          <div key={pr.number} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">#{pr.number}</span>
                                  <Badge variant={pr.merged ? "default" : "secondary"}>
                                    {pr.merged ? "Merged" : "Closed"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{pr.title}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                                  <span>{pr.author}</span>
                                  <span><Clock className="w-3 h-3 inline mr-1" />{pr.lifetime} days</span>
                                  <span>{pr.reviewCount} reviews</span>
                                  <span>{pr.commentCount} comments</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issue Metrics */}
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Issue Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Closure Rate</div>
                      <div className="text-2xl font-bold">{issueMetrics.closureRate || 0}%</div>
                      <Progress value={issueMetrics.closureRate || 0} className="h-2 mt-1" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
                      <div className="text-2xl font-bold">{issueMetrics.avgResolutionTime || 0} days</div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-lg font-bold text-green-600">{issueMetrics.closedIssues || 0}</div>
                        <div className="text-xs text-muted-foreground">Closed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{issueMetrics.openIssues || 0}</div>
                        <div className="text-xs text-muted-foreground">Open</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Closed Issues */}
                <Card className="shadow-medium lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Recently Closed Issues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {issueMetrics.recentClosedIssues?.slice(0, 8).map((issue) => (
                        <div key={issue.number} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">#{issue.number}</span>
                                {issue.labels && issue.labels.slice(0, 2).map((label) => (
                                  <Badge key={label} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{issue.title}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                                <span>{issue.author}</span>
                                <span><Clock className="w-3 h-3 inline mr-1" />{issue.resolutionTime} days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RepoDetail;