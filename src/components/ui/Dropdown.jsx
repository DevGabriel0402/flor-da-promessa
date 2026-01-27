import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div`
  width: 100%;
  padding: 12px 40px 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme, $isOpen }) => $isOpen ? theme.cores.primaria : theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.texto};
  box-shadow: ${({ theme, $isOpen }) => $isOpen ? `0 0 0 4px ${theme.cores.primariaClara}, ${theme.sombras.media}` : theme.sombras.suave};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 46px;

  &::after {
    content: '';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%) rotate(${({ $isOpen }) => $isOpen ? '180deg' : '0deg'});
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B57EDC' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    transition: transform 0.2s ease;


  
  }

  &:hover {
    border-color: ${({ theme }) => theme.cores.primaria};
    background-color: #fafafa;
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.cores.branco};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-height: 250px;
  overflow-y: auto;
  padding: 6px;
`;

const OptionItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $selected, theme }) => $selected ? theme.cores.primaria : theme.cores.texto};
  background: ${({ $selected, theme }) => $selected ? theme.cores.primariaClara : 'transparent'};
  transition: all 0.15s ease;


  &:hover {
    background: ${({ $selected, theme }) => $selected ? theme.cores.primariaClara : theme.cores.fundo};
    color: ${({ theme }) => theme.cores.primaria};
  }
`;

export const Select = ({ value, onChange, children, placeholder, ...rest }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const options = React.Children.map(children, child => {
        if (child.type === 'option') {
            return { value: child.props.value, label: child.props.children };
        }
        return null;
    }).filter(Boolean);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (onChange) {
            onChange({ target: { value: val } });
        }
        setIsOpen(false);
    };

    return (
        <SelectWrapper ref={wrapperRef} {...rest}>
            <SelectTrigger $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
            </SelectTrigger>
            {isOpen && (
                <DropdownList>
                    {options.map(opt => (
                        <OptionItem
                            key={opt.value}
                            $selected={String(opt.value) === String(value)}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </OptionItem>
                    ))}
                </DropdownList>
            )}
        </SelectWrapper>
    );
};
