import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Status {
  icon: string;
  label: string;
  count: number;
}

const initialStatuses: Status[] = [
  { icon: '💻', label: 'Working', count: 245 },
  { icon: '☕️', label: 'Coffee Break', count: 32 },
  { icon: '🍽️', label: 'Lunch', count: 18 },
  { icon: '🚶', label: 'Walking', count: 56 },
  { icon: '😴', label: 'Rest', count: 27 }
];

export const StatusBar: React.FC = () => {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleStatusClick = (label: string) => {
    setStatuses(prev => prev.map(status => 
      status.label === label 
        ? { ...status, count: status.count + 1 }
        : status
    ));
    setSelectedStatus(label);
  };

  return (
    <StyledStatusBar>
      <h2 className="status-title">Current Status</h2>
      <div className="status-container">
        {statuses.map((status) => (
          <button
            key={status.label}
            className={`status-item ${selectedStatus === status.label ? 'selected' : ''}`}
            onClick={() => handleStatusClick(status.label)}
          >
            <div className="status-icon">{status.icon}</div>
            <div className="status-info">
              <span className="status-label">{status.label}</span>
              <span className="status-count">{status.count} users</span>
            </div>
            <div className="status-glow" />
          </button>
        ))}
      </div>
      {selectedStatus && (
        <p className="status-message">
          You are currently <span className="highlight">{selectedStatus.toLowerCase()}</span>
        </p>
      )}
    </StyledStatusBar>
  );
};

const StyledStatusBar = styled.div`
  .status-title {
    text-align: center;
    color: #00894d;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    backdrop-filter: blur(10px);

    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
    }

    &.selected {
      background: rgba(0, 137, 77, 0.2);
      border-color: rgba(0, 137, 77, 0.4);
      box-shadow: 0 0 20px rgba(0, 137, 77, 0.2);

      .status-label {
        color: #00894d;
      }

      .status-count {
        color: rgba(0, 137, 77, 0.8);
      }

      .status-glow {
        opacity: 1;
      }
    }
  }

  .status-icon {
    font-size: 1.75rem;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }

  .status-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .status-label {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.8);
    transition: color 0.3s ease;
  }

  .status-count {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.6);
    transition: color 0.3s ease;
  }

  .status-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      rgba(0, 137, 77, 0.2) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .status-message {
    text-align: center;
    color: rgba(0, 0, 0, 0.7);
    font-size: 1rem;
    margin-top: 1rem;
    animation: fadeIn 0.3s ease;

    .highlight {
      color: #00894d;
      font-weight: 600;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default StatusBar;