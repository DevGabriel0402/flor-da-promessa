import React from 'react';
import styled, { keyframes } from 'styled-components';

const morph = keyframes`
  0%, 15% { /* iPhone 16 */
    width: 140px; height: 280px; border-radius: 44px;
  }
  35%, 50% { /* Samsung S24 */
    width: 155px; height: 300px; border-radius: 12px;
  }
  70%, 85% { /* iPad Pro */
    width: 260px; height: 340px; border-radius: 28px;
  }
  100% { /* Volta iPhone */
    width: 140px; height: 280px; border-radius: 44px;
  }
`;

const morphNotch = keyframes`
  0%, 15% { /* Dynamic Island iPhone */
    width: 50px; height: 18px; top: 12px; border-radius: 20px;
  }
  35%, 50% { /* Punch hole Samsung */
    width: 8px; height: 8px; top: 12px; border-radius: 50%;
  }
  70%, 85% { /* Camera iPad */
    width: 50px; height: 12px; top: -4px; border-radius: 20px;
  }
  100% { /* Volta iPhone */
    width: 50px; height: 18px; top: 12px; border-radius: 20px;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const liquid = keyframes`
  0% { transform: translateY(100%) scaleY(1); }
  50% { transform: translateY(30%) scaleY(1.1); }
  100% { transform: translateY(10%) scaleY(1); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: white;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
  background-image: 
    radial-gradient(at 0% 0%, hsla(273,73%,95%,1) 0, transparent 50%), 
    radial-gradient(at 100% 100%, hsla(273,73%,95%,1) 0, transparent 50%);
`;

const DeviceOutline = styled.div`
  position: relative;
  border: 4px solid #B57EDC;
  background: white;
  animation: ${morph} 12s infinite ease-in-out, ${float} 4s infinite ease-in-out;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 50px;
  box-shadow: 0 40px 100px rgba(181, 126, 220, 0.15);
  overflow: hidden;
  transition: all 0.5s ease;
`;

const Notch = styled.div`
  position: absolute;
  left: 50%; transform: translateX(-50%);
  background: #B57EDC;
  z-index: 10;
  animation: ${morphNotch} 12s infinite ease-in-out;
`;

const Fill = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(180deg, #B57EDC 0%, #E9D8F2 100%);
  opacity: 0.1;
  height: 150%;
  animation: ${liquid} 8s infinite alternate ease-in-out;
`;

const Content = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  color: #2E2E2E;
  font-weight: 800;
  font-size: 28px;
  margin-bottom: 12px;
`;

const Text = styled.p`
  color: #6B7280;
  font-size: 18px;
  max-width: 450px;
  line-height: 1.6;
`;

export default function DesktopBlocked() {
  return (
    <Overlay>
      <DeviceOutline>
        <Notch />
        <Fill />
        <div style={{ opacity: 0.8, fontWeight: 900, fontSize: 10, letterSpacing: 2, color: '#B57EDC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img style={{ width: '50%', height: '50%' }} src="https://res.cloudinary.com/dxs92g9nu/image/upload/v1769399355/flor-da-promessa/produtos/dhtqbroegyzchutfmoid.png" alt="" />
        </div>
      </DeviceOutline>

      <Content>
        <Title>Experiência pensada para você</Title>
        <Text>
          Esta aplicação foi desenhada exclusivamente para dispositivos mobile.
          Acesse pelo seu smartphone para aproveitar a melhor experiência de compra da <strong>Flor da Promessa</strong>.
        </Text>
      </Content>
    </Overlay>
  );
}
