import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public routes
export const getPublicRepoStats = (repoUrl) => {
  return apiClient.post('/api/public-repo-stats', { repoUrl });
};

// Auth routes
export const checkAuthStatus = () => {
  return apiClient.get('/api/me');
};

// We don't need a logout API call for stateless JWT, we just remove the token
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  return Promise.resolve();
};

// Protected routes
export const getUserStats = () => {
  return apiClient.get('/api/user-stats');
};

export const getUserRepos = () => {
  return apiClient.get('/api/repos');
};

export const getPrivateRepoStats = (repoName) => {
  return apiClient.get(`/api/private-repo-stats/${repoName}`);
};

// NEW: Core Analytics API endpoints
export const getRepositoryAnalytics = (owner, repo, metric = 'all', options = {}) => {
  const params = new URLSearchParams({
    metric,
    ...options
  });
  return apiClient.get(`/api/repo-analytics/${owner}/${repo}?${params}`);
};

// NEW: Get specific analytics
export const getActiveContributorTrend = (owner, repo) => {
  return getRepositoryAnalytics(owner, repo, 'contributor-trend');
};

export const getCodeChurn = (owner, repo, days = 30) => {
  return getRepositoryAnalytics(owner, repo, 'code-churn', { days });
};

export const getPullRequestAnalytics = (owner, repo) => {
  return getRepositoryAnalytics(owner, repo, 'pr-analytics');
};

export const getIssueAnalytics = (owner, repo) => {
  return getRepositoryAnalytics(owner, repo, 'issue-analytics');
};

// NEW: Team Health Dashboard
export const getTeamHealth = (owner, repo) => {
  return apiClient.get(`/api/team-health/${owner}/${repo}`);
};

// NEW: Search repositories with analytics
export const searchRepositories = (query, options = {}) => {
  const params = new URLSearchParams({
    q: query,
    sort: options.sort || 'stars',
    order: options.order || 'desc',
    page: options.page || 1,
    per_page: options.per_page || 30
  });
  return apiClient.get(`/api/search/repos?${params}`);
};

// NEW: Batch analytics for multiple repositories
export const getBatchAnalytics = async (repositories) => {
  const results = await Promise.allSettled(
    repositories.map(async (repo) => {
      try {
        const [owner, name] = repo.full_name.split('/');
        const analytics = await getRepositoryAnalytics(owner, name);
        return {
          repository: repo,
          analytics: analytics.data,
          status: 'fulfilled'
        };
      } catch (error) {
        return {
          repository: repo,
          error: error.message,
          status: 'rejected'
        };
      }
    })
  );
  
  return results.map(result => result.value || result.reason);
};

// NEW: Export functions for dashboard widgets
export const getDashboardMetrics = async (repositories) => {
  if (!repositories || repositories.length === 0) return null;
  
  try {
    const analytics = await getBatchAnalytics(repositories.slice(0, 10)); // Limit to 10 repos
    
    const aggregatedMetrics = {
      totalContributors: 0,
      avgCodeChurn: 0,
      avgPRLifetime: 0,
      avgIssueClosureRate: 0,
      healthScores: []
    };

    let validAnalytics = 0;
    
    analytics.forEach(item => {
      if (item.status === 'fulfilled' && item.analytics) {
        const { activeContributorTrend, codeChurn, pullRequestAnalytics, issueManagement } = item.analytics;
        
        aggregatedMetrics.totalContributors += activeContributorTrend?.totalActiveContributors || 0;
        aggregatedMetrics.avgCodeChurn += codeChurn?.avgChurnPerCommit || 0;
        aggregatedMetrics.avgPRLifetime += pullRequestAnalytics?.avgPullRequestLifetime || 0;
        aggregatedMetrics.avgIssueClosureRate += issueManagement?.closureRate || 0;
        
        validAnalytics++;
      }
    });

    if (validAnalytics > 0) {
      aggregatedMetrics.avgCodeChurn = Math.round((aggregatedMetrics.avgCodeChurn / validAnalytics) * 100) / 100;
      aggregatedMetrics.avgPRLifetime = Math.round((aggregatedMetrics.avgPRLifetime / validAnalytics) * 100) / 100;
      aggregatedMetrics.avgIssueClosureRate = Math.round((aggregatedMetrics.avgIssueClosureRate / validAnalytics) * 100) / 100;
    }

    return {
      aggregatedMetrics,
      repositoryAnalytics: analytics,
      analyzedRepositories: validAnalytics
    };
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return null;
  }
};

// Helper functions for data formatting
export const formatAnalyticsData = {
  // Format contributor trend data for charts
  contributorTrend: (data) => {
    if (!data || !data.contributorDetails) return [];
    return data.contributorDetails.map(contributor => ({
      name: contributor.name,
      commits: contributor.commits,
      activeDays: contributor.activeDays
    }));
  },

  // Format code churn data for charts
  codeChurn: (data) => {
    if (!data || !data.weeklyChurn) return [];
    return data.weeklyChurn.map(week => ({
      week: week.week,
      additions: week.additions,
      deletions: week.deletions,
      churnRate: week.churnRate,
      commits: week.commits
    }));
  },

  // Format PR analytics for display
  pullRequests: (data) => {
    if (!data || !data.prDetails) return [];
    return data.prDetails.map(pr => ({
      number: pr.number,
      title: pr.title,
      lifetime: pr.lifetime,
      timeToFirstReview: pr.timeToFirstReview,
      reviewCount: pr.reviewCount,
      merged: pr.merged,
      author: pr.author
    }));
  },

  // Format issue data for charts
  issues: (data) => {
    if (!data || !data.recentClosedIssues) return [];
    return data.recentClosedIssues.map(issue => ({
      number: issue.number,
      title: issue.title,
      resolutionTime: issue.resolutionTime,
      labels: issue.labels,
      author: issue.author
    }));
  }
};

// Utility functions for metric calculations
export const calculateMetricTrends = (currentData, previousData) => {
  if (!previousData) return { trend: 'neutral', change: 0 };
  
  const change = ((currentData - previousData) / previousData) * 100;
  const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'neutral';
  
  return { trend, change: Math.round(change * 100) / 100 };
};

export const getHealthStatusColor = (score) => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

export const formatDuration = (hours) => {
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round((hours % 24) * 10) / 10;
  return `${days}d ${remainingHours}h`;
};

export default apiClient;