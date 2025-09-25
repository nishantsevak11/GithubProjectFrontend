import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Github, 
  Star, 
  GitFork, 
  Users, 
  Code2, 
  GitCommit, 
  TrendingUp, 
  BarChart3,
  GitPullRequest,
  CheckCircle,
  Clock,
  Activity,
  MessageSquare
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

// Helper to assign colors to languages for the chart
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Ruby: '#701516',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Other: '#cccccc',
};

const RepoDisplayComponent = ({ data }) => {
  if (!data) return null;

  // Transform language data for the pie chart
  const languageData = Object.entries(data.languages).map(([name, bytes]) => ({
    name,
    value: bytes,
    color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS['Other'],
  }));
  
  const totalBytes = languageData.reduce((sum, lang) => sum + lang.value, 0);

  // Check if we have core metrics (new analytics data)
  const hasCoreMetrics = data.coreMetrics && Object.keys(data.coreMetrics).length > 0;
  
  // Process core metrics if available
  const contributorTrendData = data.coreMetrics?.activeContributorTrend?.contributorDetails || [];
  const weeklyChurnData = data.coreMetrics?.codeChurn?.weeklyChurn || [];
  const prAnalytics = data.coreMetrics?.pullRequestAnalytics || {};
  const issueMetrics = data.coreMetrics?.issueManagement || {};

  return (
    <div className="space-y-6">
      {/* Repository Overview */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Github className="w-6 h-6" />
            <span>{data.fullName}</span>
          </CardTitle>
          <CardDescription className="mt-2">{data.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Star className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.stars.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Stars</div>
            </div>
            <div className="text-center">
              <GitFork className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.forks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Forks</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.contributors}</div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </div>
            <div className="text-center">
              <GitCommit className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{typeof data.commits === 'number' ? data.commits.toLocaleString() : data.commits}</div>
              <div className="text-sm text-muted-foreground">Commits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics with Tabs (if core metrics available) */}
      {hasCoreMetrics ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="activity">Code Activity</TabsTrigger>
            <TabsTrigger value="prs">Pull Requests</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Code Statistics */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5" />
                  <span>Code Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="font-semibold mb-2">Total Lines of Code</h3>
                    <p className="text-3xl font-bold">{data.totalLines.toLocaleString()}</p>
                    <h3 className="font-semibold mt-4 mb-2">Language Breakdown</h3>
                    <div className="space-y-2">
                      {languageData.map((lang) => (
                        <div key={lang.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                            <span>{lang.name}</span>
                          </div>
                          <Badge variant="outline">
                            {((lang.value / totalBytes) * 100).toFixed(2)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {languageData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value.toLocaleString()} bytes`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.coreMetrics?.activeContributorTrend && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">{data.coreMetrics.activeContributorTrend.totalActiveContributors}</div>
                    <div className="text-xs text-muted-foreground">Active Contributors</div>
                  </CardContent>
                </Card>
              )}
              
              {data.coreMetrics?.codeChurn && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">{data.coreMetrics.codeChurn.avgChurnPerCommit}</div>
                    <div className="text-xs text-muted-foreground">Avg Churn/Commit</div>
                  </CardContent>
                </Card>
              )}
              
              {data.coreMetrics?.pullRequestAnalytics && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <GitPullRequest className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">{data.coreMetrics.pullRequestAnalytics.avgPullRequestLifetime || 0}d</div>
                    <div className="text-xs text-muted-foreground">Avg PR Lifetime</div>
                  </CardContent>
                </Card>
              )}
              
              {data.coreMetrics?.issueManagement && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">{data.coreMetrics.issueManagement.closureRate || 0}%</div>
                    <div className="text-xs text-muted-foreground">Issue Closure Rate</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors">
            {contributorTrendData.length > 0 && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Active Contributors (30 days)</span>
                  </CardTitle>
                  <CardDescription>
                    Recent contributor activity and commit patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={contributorTrendData.slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }} 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="commits" fill="#8884d8" />
                        <Bar dataKey="activeDays" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {data.coreMetrics?.activeContributorTrend && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold">{data.coreMetrics.activeContributorTrend.totalActiveContributors}</div>
                        <div className="text-xs text-muted-foreground">Total Active Contributors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{data.coreMetrics.activeContributorTrend.avgCommitsPerContributor}</div>
                        <div className="text-xs text-muted-foreground">Avg Commits per Contributor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{data.coreMetrics.activeContributorTrend.avgDailyActiveContributors}</div>
                        <div className="text-xs text-muted-foreground">Avg Daily Active Contributors</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Code Activity Tab */}
          <TabsContent value="activity">
            {weeklyChurnData.length > 0 && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Code Churn Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Code additions and deletions over recent weeks
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
                        <Area 
                          type="monotone" 
                          dataKey="additions" 
                          stackId="1" 
                          stroke="#22c55e" 
                          fill="#22c55e" 
                          fillOpacity={0.6} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="deletions" 
                          stackId="1" 
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.6} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {data.coreMetrics?.codeChurn && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">+{data.coreMetrics.codeChurn.totalAdditions}</div>
                        <div className="text-xs text-muted-foreground">Total Additions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">-{data.coreMetrics.codeChurn.totalDeletions}</div>
                        <div className="text-xs text-muted-foreground">Total Deletions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{data.coreMetrics.codeChurn.avgChurnPerCommit}</div>
                        <div className="text-xs text-muted-foreground">Avg Churn per Commit</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pull Requests Tab */}
          <TabsContent value="prs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PR Metrics */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitPullRequest className="w-5 h-5" />
                    <span>PR Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Average PR Lifetime</div>
                    <div className="text-2xl font-bold">{prAnalytics.avgPullRequestLifetime || 0} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average Time to First Review</div>
                    <div className="text-2xl font-bold">
                      {prAnalytics.avgTimeToFirstReview ? `${prAnalytics.avgTimeToFirstReview}h` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Analyzed PRs</div>
                    <div className="text-2xl font-bold">{prAnalytics.totalAnalyzedPRs || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">PRs with Reviews</div>
                    <div className="text-2xl font-bold">{prAnalytics.prsWithReviews || 0}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent PRs List */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Recent Pull Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prAnalytics.prDetails?.slice(0, 6).map((pr) => (
                      <div key={pr.number} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">#{pr.number}</span>
                              <Badge variant={pr.merged ? "default" : "secondary"}>
                                {pr.merged ? "Merged" : "Closed"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">{pr.title}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
                              <span>{pr.author}</span>
                              <span><Clock className="w-3 h-3 inline mr-1" />{pr.lifetime} days</span>
                              <span>{pr.reviewCount} reviews</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-4">No PR data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="text-sm text-muted-foreground">Issue Closure Rate</div>
                    <div className="text-2xl font-bold">{issueMetrics.closureRate || 0}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average Resolution Time</div>
                    <div className="text-2xl font-bold">{issueMetrics.avgResolutionTime || 0} days</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-lg font-bold text-green-600">{issueMetrics.closedIssues || 0}</div>
                      <div className="text-xs text-muted-foreground">Closed Issues</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-600">{issueMetrics.openIssues || 0}</div>
                      <div className="text-xs text-muted-foreground">Open Issues</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Closed Issues */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Recently Closed Issues</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issueMetrics.recentClosedIssues?.slice(0, 6).map((issue) => (
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
                            <p className="text-sm text-muted-foreground truncate mt-1">{issue.title}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
                              <span>{issue.author}</span>
                              <span><Clock className="w-3 h-3 inline mr-1" />{issue.resolutionTime} days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-4">No issue data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Fallback to original single card view if no core metrics
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code2 className="w-5 h-5" />
              <span>Code Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="font-semibold mb-2">Total Lines of Code (by bytes)</h3>
                <p className="text-3xl font-bold">{data.totalLines.toLocaleString()}</p>
                <h3 className="font-semibold mt-4 mb-2">Language Breakdown</h3>
                <div className="space-y-2">
                  {languageData.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                        <span>{lang.name}</span>
                      </div>
                      <Badge variant="outline">
                        {((lang.value / totalBytes) * 100).toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {languageData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value.toLocaleString()} bytes`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RepoDisplayComponent;