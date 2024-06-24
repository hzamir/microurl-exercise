import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FrameContent = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  padding: 20px;
  max-width: 500px;
  width: 100%;
  z-index: 1000;
`;

type ModalizeProps = {
  children: ReactNode;
};

// the purpose of this component is to provide a modal appearance to its children
export const Modalize: React.FC<ModalizeProps> = ({ children }) => {
  return (
    <Overlay>
      <FrameContent>{children}</FrameContent>
    </Overlay>
  );
};
