import styled from 'styled-components';
import React from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
}

export const Card3D: React.FC<Card3DProps> = ({ children, className = '' }) => {
  return (
    <StyledWrapper className={className}>
      <div className="parent">
        <div className="card">
          <div className="glass" />
          <div className="content">{children}</div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .parent {
    perspective: 1000px;
    transform-style: preserve-3d;
  }

  .card {
    position: relative;
    border-radius: 24px;
    background: linear-gradient(135deg, rgb(0, 255, 214) 0%, rgb(8, 226, 96) 100%);
    transition: all 0.5s ease-in-out;
    transform-style: preserve-3d;
    box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, 
                rgba(5, 71, 17, 0.2) 0px 25px 25px -5px;
  }

  .glass {
    transform-style: preserve-3d;
    position: absolute;
    inset: 8px;
    border-radius: 20px;
    border-top-right-radius: 100%;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.4) 100%);
    transform: translate3d(0px, 0px, 25px);
    border-left: 1px solid rgba(255, 255, 255, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    transition: all 0.5s ease-in-out;
  }

  .content {
    position: relative;
    z-index: 1;
    transform: translate3d(0, 0, 26px);
    color: #00894d;
  }

  .parent:hover .card {
    transform: rotate3d(1, 1, 0, 15deg);
    box-shadow: rgba(5, 71, 17, 0.3) 30px 50px 25px -40px, 
                rgba(5, 71, 17, 0.1) 0px 25px 30px 0px;
  }
`;