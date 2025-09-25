import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Github, 
  Star, 
  GitFork, 
  Code, 
  LogOut, 
  ExternalLink, 
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitPullRequest,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserStats, getUserRepos, getTeamHealth, getDashboardMetrics } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [teamHealthData, setTeamHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Only fetch data if the user is authenticated
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch both user stats and repositories in parallel
          const [statsResponse, reposResponse] = await Promise.all([
            getUserStats(),
            getUserRepos()
          ]);
          
          setStats(statsResponse.data);
          // The backend nests the repository list in a 'repos' key
          const repoList = reposResponse.data.repos;
          setRepos(repoList); 

          // Fetch enhanced analytics for top repositories
          if (repoList && repoList.length > 0) {
            try {
              const metrics = await getDashboardMetrics(repoList);
              if (metrics) {
                setDashboardMetrics(metrics);
              }

              // Fetch team health for top 5 repositories
              const healthPromises = repoList
                .slice(0, 5)
                .map(async (repo) => {
                  try {
                    const healthResponse = await getTeamHealth(user.username, repo.name);
                    return {
                      ...repo,
                      health: healthResponse.data
                    };
                  } catch (error) {
                    console.log(`Could not fetch health for ${repo.name}:`, error);
                    return {
                      ...repo,
                      health: null
                    };
                  }
                });

              const healthResults = await Promise.allSettled(healthPromises);
              const validHealthData = healthResults
                .filter(result => result.status === 'fulfilled' && result.value.health)
                .map(result => result.value);
              
              setTeamHealthData(validHealthData);
            } catch (analyticsError) {
              console.log('Could not fetch enhanced analytics:', analyticsError);
            }
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Calculate aggregated health score
  const avgHealthScore = teamHealthData.length > 0 
    ? Math.round(teamHealthData.reduce((sum, repo) => sum + repo.health.healthScore, 0) / teamHealthData.length)
    : null;

  const getHealthStatusColor = (score) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getHealthStatusText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Profile Card */}
          {user && (
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{user.displayName || user.username}</CardTitle>
                    <CardDescription className="text-lg">@{user.username}</CardDescription>
                  </div>
                  {avgHealthScore && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" style={{ color: getHealthStatusColor(avgHealthScore) }} />
                        <div>
                          <div className="text-2xl font-bold" style={{ color: getHealthStatusColor(avgHealthScore) }}>
                            {avgHealthScore}
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Team Health</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Enhanced Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="health">Team Health</TabsTrigger>
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="shadow-medium">
                    <CardContent className="p-6 text-center">
                      <Github className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold">{stats.stats.totalRepos}</div>
                      <div className="text-muted-foreground">Total Repositories</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-medium">
                    <CardContent className="p-6 text-center">
                      <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-3xl font-bold">{stats.stats.totalStars}</div>
                      <div className="text-muted-foreground">Total Stars</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-medium">
                    <CardContent className="p-6 text-center">
                      <GitFork className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <div className="text-3xl font-bold">{stats.stats.totalForks}</div>
                      <div className="text-muted-foreground">Total Forks</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-medium">
                    <CardContent className="p-6 text-center">
                      <Code className="w-8 h-8 text-success mx-auto mb-2" />
                      <div className="text-3xl font-bold">{stats.stats.totalLinesOfCode.toLocaleString()}</div>
                      <div className="text-muted-foreground">Total Lines of Code</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Languages */}
              {stats?.stats.topLanguages && (
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Top Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {stats.stats.topLanguages.map((lang, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-semibold">{lang.language}</div>
                          <div className="text-sm text-muted-foreground">{lang.lines.toLocaleString()} lines</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {dashboardMetrics && (
                <>
                  {/* Aggregated Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-medium">
                      <CardContent className="p-6 text-center">
                        <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{dashboardMetrics.aggregatedMetrics.totalContributors}</div>
                        <div className="text-muted-foreground">Total Active Contributors</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-medium">
                      <CardContent className="p-6 text-center">
                        <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{dashboardMetrics.aggregatedMetrics.avgCodeChurn}</div>
                        <div className="text-muted-foreground">Avg Code Churn</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-medium">
                      <CardContent className="p-6 text-center">
                        <GitPullRequest className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{dashboardMetrics.aggregatedMetrics.avgPRLifetime}d</div>
                        <div className="text-muted-foreground">Avg PR Lifetime</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-medium">
                      <CardContent className="p-6 text-center">
                        <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{dashboardMetrics.aggregatedMetrics.avgIssueClosureRate}%</div>
                        <div className="text-muted-foreground">Avg Issue Closure Rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analytics Summary */}
                  <Card className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Analytics Summary</span>
                      </CardTitle>
                      <CardDescription>
                        Based on analysis of {dashboardMetrics.analyzedRepositories} repositories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                            Key Insights
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Active contributor base: {dashboardMetrics.aggregatedMetrics.totalContributors} developers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>Average PR review cycle: {dashboardMetrics.aggregatedMetrics.avgPRLifetime} days</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-4 h-4 text-purple-500" />
                              <span>Code churn rate: {dashboardMetrics.aggregatedMetrics.avgCodeChurn} lines per commit</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-green-500" />
                            Performance Indicators
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Issue Resolution</span>
                                <span>{dashboardMetrics.aggregatedMetrics.avgIssueClosureRate}%</span>
                              </div>
                              <Progress value={dashboardMetrics.aggregatedMetrics.avgIssueClosureRate} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Code Quality (Low Churn)</span>
                                <span>{Math.max(0, 100 - dashboardMetrics.aggregatedMetrics.avgCodeChurn)}%</span>
                              </div>
                              <Progress 
                                value={Math.max(0, 100 - dashboardMetrics.aggregatedMetrics.avgCodeChurn)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Team Health Tab */}
            <TabsContent value="health" className="space-y-6">
              {teamHealthData.length > 0 ? (
                <>
                  {/* Overall Health Score */}
                  <Card className="shadow-elegant border-l-4" style={{ borderLeftColor: getHealthStatusColor(avgHealthScore) }}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>Overall Team Health</span>
                        </div>
                        <Badge 
                          variant="outline"
                          style={{ color: getHealthStatusColor(avgHealthScore), borderColor: getHealthStatusColor(avgHealthScore) }}
                        >
                          {getHealthStatusText(avgHealthScore)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl font-bold" style={{ color: getHealthStatusColor(avgHealthScore) }}>
                          {avgHealthScore}
                        </div>
                        <div className="flex-1">
                          <Progress value={avgHealthScore} className="h-3" />
                          <p className="text-sm text-muted-foreground mt-1">
                            Average health score across {teamHealthData.length} repositories
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Repository Health */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamHealthData.map((repo) => (
                      <Card key={repo.id} className="shadow-medium">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            <Link to={`/repo/${repo.name}`} className="hover:text-primary">
                              {repo.name}
                            </Link>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="text-xl font-bold" 
                                style={{ color: repo.health.statusColor }}
                              >
                                {repo.health.healthScore}
                              </div>
                              <Badge 
                                variant="outline"
                                style={{ color: repo.health.statusColor, borderColor: repo.health.statusColor }}
                              >
                                {repo.health.status}
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Progress value={repo.health.healthScore} className="h-2 mb-4" />
                          {repo.health.factors.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
                                Top Issues
                              </h5>
                              {repo.health.factors.slice(0, 2).map((factor, index) => (
                                <div key={index} className="text-xs p-2 bg-muted/50 rounded">
                                  <div className="font-medium text-destructive">{factor.factor}</div>
                                  <div className="text-muted-foreground">{factor.recommendation}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card className="shadow-medium">
                  <CardContent className="text-center py-12">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Team Health Data Available</h3>
                    <p className="text-muted-foreground">
                      Team health metrics will appear here once repository analytics are available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Repositories Tab */}
            <TabsContent value="repositories" className="space-y-6">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Github className="w-5 h-5" />
                    <span>Your Repositories</span>
                  </CardTitle>
                  <CardDescription>
                    Click on any repository to view detailed analytics and team health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {repos.map((repo) => {
                      const repoHealth = teamHealthData.find(h => h.id === repo.id);
                      return (
                        <Link
                          key={repo.id}
                          to={`/repo/${repo.name}`}
                          className="block p-4 border rounded-lg hover:shadow-medium transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold hover:text-primary">{repo.name}</h3>
                                {repo.isPrivate && <Badge variant="secondary">Private</Badge>}
                                {repoHealth && (
                                  <Badge 
                                    variant="outline"
                                    style={{ 
                                      color: repoHealth.health.statusColor, 
                                      borderColor: repoHealth.health.statusColor 
                                    }}
                                  >
                                    Health: {repoHealth.health.healthScore}
                                  </Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-muted-foreground text-sm mt-1">{repo.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                {repo.language && (
                                  <span className="flex items-center space-x-1">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span>{repo.language}</span>
                                  </span>
                                )}
                                <span className="flex items-center space-x-1">
                                  <Star className="w-3 h-3" />
                                  <span>{repo.stars}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <GitFork className="w-3 h-3" />
                                  <span>{repo.forks}</span>
                                </span>
                                {repoHealth && (
                                  <span className="flex items-center space-x-1">
                                    <Activity className="w-3 h-3" />
                                    <span>{repoHealth.health.status}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;