import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.cores.branco};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 20px;
`;

const LogoLoading = styled.img`
  width: 120px;
  height: auto;
  animation: ${pulse} .5s infinite ease-in-out;
`;


export default function Loading() {
    return (
        <Overlay>
            <LogoLoading
                src="https://res.cloudinary.com/dxs92g9nu/image/upload/v1769406568/flor-da-promessa/logo/xvxidy7lqsam2nayhlmt.png"
                alt=""
            />
        </Overlay>
    );
}
