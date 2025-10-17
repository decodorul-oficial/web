'use client';

import React, { useState } from 'react';
import { useGraphQL } from '@/hooks/useGraphQL';
import { CountdownTimer } from './CountdownTimer';
import { 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// GraphQL Queries and Mutations
const GET_ALL_CRON_JOBS_STATUS = `
  query GetAllCronJobsStatus {
    getAllCronJobsStatus {
      jobName
      status
      lastRun
      nextRun
      metrics {
        totalRuns
        successfulRuns
        failedRuns
        averageRuntime
      }
    }
  }
`;

const GET_CRON_JOB_LOGS = `
  query GetCronJobLogs($jobName: String, $startDate: String, $endDate: String, $status: CronJobStatusType, $limit: Int, $offset: Int) {
    getCronJobLogs(
      jobName: $jobName
      startDate: $startDate
      endDate: $endDate
      status: $status
      limit: $limit
      offset: $offset
    ) {
      logs {
        id
        jobName
        startTime
        endTime
        status
        error
        duration
        success
        timestamp
        execution {
          status
          message
        }
        results
        errorDetails {
          message
          name
          stack
          timestamp
        }
      }
      pagination {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const RUN_CRON_JOB = `
  mutation RunCronJob($jobName: String!) {
    runCronJob(jobName: $jobName) {
      jobName
      status
      lastRunDuration
      lastRunError
    }
  }
`;

const ENABLE_CRON_JOB = `
  mutation EnableCronJob($jobName: String!) {
    enableCronJob(jobName: $jobName) {
      jobName
      status
      isEnabled
    }
  }
`;

const DISABLE_CRON_JOB = `
  mutation DisableCronJob($jobName: String!) {
    disableCronJob(jobName: $jobName) {
      jobName
      status
      isEnabled
    }
  }
`;

const CLEAR_CRON_JOB_LOGS = `
  mutation ClearCronJobLogs($jobName: String, $olderThan: String, $status: CronJobStatusType) {
    clearCronJobLogs(
      jobName: $jobName
      olderThan: $olderThan
      status: $status
    )
  }
`;

// Types
interface CronJobStatus {
  jobName: string;
  status: 'RUNNING' | 'STOPPED' | 'DISABLED' | 'ERROR' | 'IDLE';
  lastRun: string | null;
  nextRun: string | null;
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageRuntime: number;
  };
}

interface CronJobLog {
  id: string;
  jobName: string;
  startTime: string;
  endTime: string | null;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  error: string | null;
  duration: number | null;
  success: boolean;
  timestamp: string;
  execution: {
    status: string;
    message: string;
  };
  results?: any;
  errorDetails?: {
    message: string;
    name: string;
    stack: string;
    timestamp: string;
  };
}

interface CronJobLogsResponse {
  logs: CronJobLog[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function CronJobsManager() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  // Removed logsOffset as it's now calculated from currentPage
  const [logsLimit] = useState(20);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);

  // Fetch all cron jobs status with conditional auto-refresh
  const { data: jobsData, loading: jobsLoading, refetch: refetchJobs } = useGraphQL<{
    getAllCronJobsStatus: CronJobStatus[];
  }>(GET_ALL_CRON_JOBS_STATUS, undefined, {
    pollInterval: autoRefresh ? 30000 : undefined // Refresh every 30 seconds only if auto-refresh is enabled
  });

  // Stabilizează variabilele pentru logs pentru a evita re-executarea în buclă
  const logsVariables = React.useMemo(() => ({
    jobName: selectedJob,
    limit: logsLimit,
    offset: (currentPage - 1) * logsLimit
  }), [selectedJob, logsLimit, currentPage]);

  // Fetch logs for selected job
  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useGraphQL<{
    getCronJobLogs: CronJobLogsResponse;
  }>(GET_CRON_JOB_LOGS, logsVariables, {
    skip: !selectedJob
  });

  const jobs = jobsData?.getAllCronJobsStatus || [];
  const logs = logsData?.getCronJobLogs?.logs || [];
  const logsPagination = logsData?.getCronJobLogs?.pagination;

  // Update pagination state when data changes
  React.useEffect(() => {
    if (logsPagination) {
      setTotalPages(logsPagination.totalPages);
      setTotalLogsCount(logsPagination.totalCount);
    }
  }, [logsPagination]);

  const handleRunJob = async (jobName: string) => {
    setActionLoading(jobName);
    try {
      const client = await import('@/lib/graphql/client').then(m => m.getGraphQLClient());
      await client.request(RUN_CRON_JOB, { jobName });
      refetchJobs();
      if (selectedJob === jobName) {
        refetchLogs();
      }
    } catch (error) {
      console.error('Error running job:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableJob = async (jobName: string) => {
    setActionLoading(jobName);
    try {
      const client = await import('@/lib/graphql/client').then(m => m.getGraphQLClient());
      await client.request(ENABLE_CRON_JOB, { jobName });
      refetchJobs();
    } catch (error) {
      console.error('Error enabling job:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisableJob = async (jobName: string) => {
    setActionLoading(jobName);
    try {
      const client = await import('@/lib/graphql/client').then(m => m.getGraphQLClient());
      await client.request(DISABLE_CRON_JOB, { jobName });
      refetchJobs();
    } catch (error) {
      console.error('Error disabling job:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearLogs = async (jobName: string) => {
    if (!confirm(`Ești sigur că vrei să ștergi log-urile pentru job-ul "${jobName}"?`)) {
      return;
    }

    setActionLoading(jobName);
    try {
      const client = await import('@/lib/graphql/client').then(m => m.getGraphQLClient());
      await client.request(CLEAR_CRON_JOB_LOGS, { jobName });
      refetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleJobSelect = (jobName: string | null) => {
    setSelectedJob(jobName);
    setCurrentPage(1); // Reset to first page when selecting new job
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Pagina anterioară"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  1
                </button>
              );
              
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    i === currentPage
                      ? 'bg-brand-accent text-white font-medium'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {i}
                </button>
              );
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  {totalPages}
                </button>
              );
            }
            return pages;
          })()}
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Pagina următoare"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const getStatusIcon = (job: CronJobStatus) => {
    switch (job.status) {
      case 'RUNNING':
        return <Activity className="w-5 h-5 text-green-500" />;
      case 'IDLE':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'STOPPED':
        return <Pause className="w-5 h-5 text-gray-500" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'DISABLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (job: CronJobStatus) => {
    switch (job.status) {
      case 'RUNNING':
        return 'text-green-600 bg-green-100';
      case 'IDLE':
        return 'text-blue-600 bg-blue-100';
      case 'STOPPED':
        return 'text-gray-600 bg-gray-100';
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      case 'DISABLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('ro-RO');
  };

  // Helper function to get the correct display state
  const getJobState = (job: CronJobStatus) => {
    // Determină starea bazată pe status
    const isEnabled = job.status !== 'DISABLED';
    
    return {
      status: job.status,
      statusText: job.status,
      stateText: isEnabled ? 'Enabled' : 'Disabled',
      stateColor: isEnabled ? 'text-green-600' : 'text-red-600'
    };
  };

  // Helper function to format duration (currently unused but kept for future use)
  // const formatDuration = (ms: number) => {
  //   if (ms < 1000) return `${ms}ms`;
  //   if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  //   return `${(ms / 60000).toFixed(1)}m`;
  // };

  // Helper function to format execution time
  const formatExecutionTime = (ms: number) => {
    if (ms === 0) return 'Instant';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Helper function to format timestamp as YYYY-MM-DD HH:MM:SS
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Helper function to format time for Start/End (with date only if different day)
  const formatTimeWithConditionalDate = (startTime: string, endTime: string | null): { start: string; end: string } => {
    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : startDate;
    
    const startTimeStr = startDate.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    const endTimeStr = endDate.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    // Check if dates are different
    const isDifferentDay = startDate.toDateString() !== endDate.toDateString();
    
    if (isDifferentDay) {
      const startDateStr = startDate.toLocaleDateString('ro-RO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const endDateStr = endDate.toLocaleDateString('ro-RO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      return {
        start: `${startTimeStr} ${startDateStr}`,
        end: `${endTimeStr} ${endDateStr}`
      };
    }
    
    return {
      start: startTimeStr,
      end: endTimeStr
    };
  };

  // Helper function to process logs and create detailed state transitions
  const processJobLogs = (logs: CronJobLog[]) => {
    if (!logs || logs.length === 0) return [];

    // Sort logs by startTime in descending order (newest first)
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Group consecutive logs with same status and timestamp
    const groupedLogs = [];
    let currentGroup = [sortedLogs[0]];

    for (let i = 1; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const previousLog = sortedLogs[i - 1];
      
      // Group if same status and very close timestamps (within 1 second)
      const timeDiff = Math.abs(
        new Date(currentLog.startTime).getTime() - new Date(previousLog.startTime).getTime()
      );
      
      if (currentLog.status === previousLog.status && timeDiff < 1000) {
        currentGroup.push(currentLog);
      } else {
        groupedLogs.push([...currentGroup]);
        currentGroup = [currentLog];
      }
    }
    groupedLogs.push(currentGroup);

    // Create detailed transitions
    const transitions = [];
    
    for (let i = 0; i < groupedLogs.length; i++) {
      const currentGroup = groupedLogs[i];
      const nextGroup = groupedLogs[i + 1];
      const firstLog = currentGroup[0];
      const lastLog = currentGroup[currentGroup.length - 1];
      
      // Calculate execution time
      const startTime = new Date(firstLog.startTime).getTime();
      const endTime = new Date(firstLog.endTime || firstLog.startTime).getTime();
      const executionTime = endTime - startTime;
      
      // Calculate duration between first and last log in group
      const groupDuration = currentGroup.length > 1 ? 
        new Date(firstLog.startTime).getTime() - new Date(lastLog.startTime).getTime() : 0;

      transitions.push({
        id: firstLog.id,
        currentStatus: firstLog.status,
        previousStatus: nextGroup?.[0]?.status || null,
        timestamp: firstLog.startTime,
        endTime: firstLog.endTime,
        executionTime: executionTime,
        groupDuration: groupDuration,
        eventCount: currentGroup.length,
        isTransition: nextGroup && nextGroup[0]?.status !== firstLog.status,
        isLast: i === 0,
        isFirst: i === groupedLogs.length - 1,
        hasError: firstLog.error !== null,
        error: firstLog.error,
        logs: currentGroup
      });
    }

    return transitions;
  };

  // Helper function to get status display info
  const getStatusDisplayInfo = (status: string) => {
    switch (status) {
      case 'IDLE':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'IDLE'
        };
      case 'RUNNING':
        return {
          icon: <Activity className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'RUNNING'
        };
      case 'DISABLED':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'DISABLED'
        };
      case 'ERROR':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'ERROR'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status
        };
    }
  };

  if (jobsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-8 h-8 animate-spin text-brand" />
          <span className="ml-2 text-gray-600">Se încarcă job-urile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Jobs Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-brand" />
            Cron Jobs Status
          </h2>
          <div className="flex items-center space-x-3">
            {/* Auto-refresh Toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                  autoRefresh ? 'bg-brand' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={autoRefresh}
                aria-label="Toggle auto-refresh"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium ${autoRefresh ? 'text-brand' : 'text-gray-500'}`}>
                  {autoRefresh ? 'ON' : 'OFF'}
                </span>
                {autoRefresh && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-brand rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Manual Refresh Button */}
            <button
              onClick={() => refetchJobs()}
              className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr 
                  key={job.jobName} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleJobSelect(job.jobName)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(job)}
                      <span className="ml-2 font-medium text-gray-900">{job.jobName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {(() => {
                        const jobState = getJobState(job);
                        return (
                          <>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job)}`}>
                              {jobState.statusText}
                            </span>
                            <span className={`text-xs ${jobState.stateColor}`}>
                              {jobState.stateText}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(job.lastRun)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <CountdownTimer nextRun={job.nextRun} lastRun={job.lastRun} status={job.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {job.metrics.totalRuns > 0 ? 
                      Math.round((job.metrics.successfulRuns / job.metrics.totalRuns) * 100) : 0}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRunJob(job.jobName)}
                        disabled={actionLoading === job.jobName}
                        className="inline-flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        title="Run Job"
                      >
                        {actionLoading === job.jobName ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>
                      
                      {job.status === 'DISABLED' ? (
                        <button
                          onClick={() => handleEnableJob(job.jobName)}
                          disabled={actionLoading === job.jobName}
                          className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                          title="Enable Job"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisableJob(job.jobName)}
                          disabled={actionLoading === job.jobName}
                          className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          title="Disable Job"
                        >
                          <Pause className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-brand" />
              Job Logs
              {selectedJob && (
                <span className="ml-3 text-lg font-normal text-gray-600">
                  - {selectedJob}
                </span>
              )}
            </h2>
            {selectedJob && totalLogsCount > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Afișând {((currentPage - 1) * logsLimit) + 1}-{Math.min(currentPage * logsLimit, totalLogsCount)} din {totalLogsCount} log-uri
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedJob || ''}
              onChange={(e) => handleJobSelect(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">Selectează un job</option>
              {jobs.map((job) => (
                <option key={job.jobName} value={job.jobName}>
                  {job.jobName}
                </option>
              ))}
            </select>
            {selectedJob && (
              <button
                onClick={() => handleClearLogs(selectedJob)}
                disabled={actionLoading === selectedJob}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {!selectedJob ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Selectează un job pentru a vedea log-urile</p>
            <p className="text-sm">Click pe un rând din tabelul de mai sus sau folosește dropdown-ul</p>
          </div>
        ) : logsLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-brand" />
            <span className="ml-2 text-gray-600">Se încarcă log-urile...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nu există log-uri pentru acest job
          </div>
        ) : (
          <div className="space-y-3">
            {processJobLogs(logs).map((transition) => {
              const currentInfo = getStatusDisplayInfo(transition.currentStatus);
              const previousInfo = transition.previousStatus ? getStatusDisplayInfo(transition.previousStatus) : null;
              
              return (
                <div key={transition.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {/* Single Row with All Information */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Timestamp */}
                      <div className="text-sm font-mono text-gray-600 flex-shrink-0">
                        {formatTimestamp(transition.timestamp)}
                      </div>
                      
                      {/* Status Transition */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {transition.isTransition && previousInfo ? (
                          <>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${previousInfo.bgColor} ${previousInfo.color}`}>
                              {previousInfo.icon}
                              <span>{previousInfo.label}</span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${currentInfo.bgColor} ${currentInfo.color}`}>
                              {currentInfo.icon}
                              <span>{currentInfo.label}</span>
                            </div>
                          </>
                        ) : (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${currentInfo.bgColor} ${currentInfo.color}`}>
                            {currentInfo.icon}
                            <span>{currentInfo.label}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Inline Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-600 flex-1">
                        {(() => {
                          const timeInfo = formatTimeWithConditionalDate(transition.timestamp, transition.endTime);
                          return (
                            <>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Start:</span>
                                <span className="text-gray-500">{timeInfo.start}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">End:</span>
                                <span className="text-gray-500">{timeInfo.end}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Execution Time:</span>
                                <span className="text-gray-500">{formatExecutionTime(transition.executionTime)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {transition.eventCount > 1 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {transition.eventCount} events
                        </span>
                      )}
                      {transition.isLast && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Latest</span>
                      )}
                      {transition.isFirst && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Oldest</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Detailed Execution Information */}
                  {transition.logs && transition.logs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {transition.logs.map((log, logIndex) => (
                        <div key={`${log.id}-${logIndex}`} className="bg-gray-50 rounded-lg p-3">
                          {/* Execution Status */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-600">Execution Status:</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {log.execution?.status || log.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.timestamp && new Date(log.timestamp).toLocaleString('ro-RO')}
                            </div>
                          </div>

                          {/* Execution Message */}
                          {log.execution?.message && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-600">Message:</span>
                              <span className="ml-2 text-xs text-gray-700">{log.execution.message}</span>
                            </div>
                          )}

                          {/* Results for successful executions */}
                          {log.success && log.results && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-600">Results:</span>
                              <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                <pre className="whitespace-pre-wrap text-green-700">
                                  {JSON.stringify(log.results, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Error Details for failed executions */}
                          {!log.success && log.errorDetails && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-600">Error Details:</span>
                              <div className="mt-1 space-y-1">
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                                  <div className="font-medium text-red-700 mb-1">
                                    {log.errorDetails.name}: {log.errorDetails.message}
                                  </div>
                                  <div className="text-red-600 text-xs">
                                    <span className="font-medium">Timestamp:</span> {new Date(log.errorDetails.timestamp).toLocaleString('ro-RO')}
                                  </div>
                                </div>
                                {log.errorDetails.stack && (
                                  <details className="mt-2">
                                    <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                                      Stack Trace
                                    </summary>
                                    <pre className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                      {log.errorDetails.stack}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Legacy error display for backward compatibility */}
                          {!log.success && log.error && !log.errorDetails && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-600">Error:</span>
                              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                {log.error}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination */}
        {selectedJob && renderPagination()}
      </div>
    </div>
  );
}
