import React, { useState, useEffect } from 'react';
import { BarChart, Clock, Monitor, Play, Repeat } from 'lucide-react';
import { Card3D } from './Card3D';
import styled from 'styled-components';

interface ProgramStats {
  duration: number;
  launches: number;
  lastActive: number;
}

interface Statistics {
  appUsageTime: Record<string, number>;
  breaksTaken: Record<string, number>;
  programUsage: Record<string, ProgramStats>;
}

export function Statistics() {
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const statistics = await window.electron?.statistics.get();
      if (statistics) {
        setStats(statistics);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayUsage = stats.appUsageTime[today] || 0;
  const todayBreaks = stats.breaksTaken[today] || 0;

  // Get programs active in last 5 hours
  const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
  const recentPrograms = Object.entries(stats.programUsage)
    .filter(([, data]) => data.lastActive > fiveHoursAgo)
    .sort(([, a], [, b]) => b.duration - a.duration)
    .slice(0, 5);

  return (
    <StyledStats>
      <Card3D>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BarChart className="w-6 h-6 mr-2" />
            Usage Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="stat-card">
                <Clock className="w-6 h-6" />
                <div>
                  <p className="text-sm opacity-90">Today's Computer Usage</p>
                  <p className="text-lg font-semibold">
                    {Math.floor(todayUsage / 60)}h {todayUsage % 60}m
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <Monitor className="w-6 h-6" />
                <div>
                  <p className="text-sm opacity-90">Breaks Taken Today</p>
                  <p className="text-lg font-semibold">{todayBreaks} breaks</p>
                </div>
              </div>
            </div>

            <div className="programs-list">
              <h3 className="text-sm font-medium opacity-90 mb-4">
                Most Used Apps (Last 5 Hours)
              </h3>
              <div className="space-y-3">
                {recentPrograms.map(([program, data]) => (
                  <div key={program} className="program-item">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{program}</span>
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(data.duration / 60)}h {data.duration % 60}m
                        </span>
                        <span className="flex items-center">
                          <Play className="w-3 h-3 mr-1" />
                          {data.launches} launches
                        </span>
                      </div>
                    </div>
                    <div className="usage-bar" style={{ 
                      '--usage-percent': `${(data.duration / recentPrograms[0][1].duration) * 100}%` 
                    } as React.CSSProperties} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card3D>
    </StyledStats>
  );
}

const StyledStats = styled.div`
  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .programs-list {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .program-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateX(4px);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .usage-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--usage-percent);
    background: rgba(0, 137, 77, 0.1);
    z-index: 0;
  }
`;