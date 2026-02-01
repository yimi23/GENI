/**
 * Health Reports Dashboard Component
 * Shows last report sent, adherence metrics, and next scheduled report
 */

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '../../services/socket';

interface ReportStatus {
  lastHealthReportAt: string | null;
  lastAdherenceReportAt: string | null;
  nextHealthReportAt: string;
  nextAdherenceReportAt: string;
  todayAdherence: number;
  weekAdherence: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function HealthReportsStatus() {
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/reports/status');
        if (response.ok) {
          const data = await response.json();
          setReportStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch report status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Listen for report updates
    socket.on('report_sent', (data) => {
      console.log('📊 Report sent:', data);
      setReportStatus(prev => ({
        ...prev!,
        lastHealthReportAt: data.type === 'health' ? new Date().toISOString() : prev!.lastHealthReportAt,
        lastAdherenceReportAt: data.type === 'adherence' ? new Date().toISOString() : prev!.lastAdherenceReportAt,
      }));
    });

    return () => {
      socket.off('report_sent');
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500">
        <div className="animate-spin w-6 h-6 mx-auto mb-2">⏳</div>
        Loading report status...
      </div>
    );
  }

  if (!reportStatus) {
    return null;
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      className="grid grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Health Report Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Daily Health Report</h3>
          <Calendar size={16} className="text-blue-500" />
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <p className="text-gray-500">Last Sent</p>
            <p className="text-gray-900 font-medium">
              {reportStatus.lastHealthReportAt 
                ? `${formatDate(reportStatus.lastHealthReportAt)} ${formatTime(reportStatus.lastHealthReportAt)}`
                : 'Never'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500">Next Scheduled</p>
            <p className="text-blue-600 font-medium">
              Tomorrow 8:00 AM
            </p>
          </div>
        </div>
      </div>

      {/* Adherence Report Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Weekly Adherence</h3>
          <TrendingUp size={16} className={
            reportStatus.trend === 'improving' ? 'text-green-500' :
            reportStatus.trend === 'declining' ? 'text-red-500' :
            'text-gray-500'
          } />
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <p className="text-gray-500">This Week</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-gray-900">{reportStatus.weekAdherence}%</p>
              <span className={`text-xs font-medium ${
                reportStatus.trend === 'improving' ? 'text-green-600' :
                reportStatus.trend === 'declining' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {reportStatus.trend === 'improving' ? '↑ Improving' :
                 reportStatus.trend === 'declining' ? '↓ Declining' :
                 '→ Stable'}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-gray-500">Next Report</p>
            <p className="text-blue-600 font-medium">
              Sunday 6:00 PM
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
