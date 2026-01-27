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
  position: ${({ $accordion }) => $accordion ? 'static' : 'absolute'};
  top: ${({ $accordion }) => $accordion ? '0' : 'calc(100% + 6px)'};
  margin-top: ${({ $accordion }) => $accordion ? '10px' : '0'};
  left: 0;
  right: 0;
  background: ${({ theme, $accordion }) => $accordion ? 'transparent' : theme.cores.branco};
  border: ${({ $accordion }) => $accordion ? 'none' : '1px solid #E5E7EB'};
  border-radius: 12px;
  box-shadow: ${({ $accordion }) => $accordion ? 'none' : '0 10px 25px rgba(0,0,0,0.1)'};
  max-height: ${({ $accordion }) => $accordion ? 'none' : '250px'};
  overflow-y: ${({ $accordion }) => $accordion ? 'visible' : 'auto'};
  padding: ${({ $accordion }) => $accordion ? '0' : '6px'};
  display: flex;
  flex-direction: column;
  gap: ${({ $accordion }) => $accordion ? '8px' : '2px'};
  transition: all 0.3s ease;
  z-index: 100;
`;

const OptionItem = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ $selected, $disabled, theme }) => {
        if ($disabled) return theme.cores.cinza;
        return $selected ? theme.cores.primaria : theme.cores.texto;
    }};
  background: ${({ $selected, theme, $accordion }) => {
        if ($accordion) return $selected ? theme.cores.primariaClara : theme.cores.fundo;
        return $selected ? theme.cores.primariaClara : 'transparent';
    }};
  border: 1px solid ${({ $selected, theme, $accordion }) => {
        if ($accordion) return $selected ? theme.cores.primaria : theme.cores.borda;
        return 'transparent';
    }};
  transition: all 0.15s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.4 : 1};

  &:hover {
    background: ${({ $selected, $disabled, theme, $accordion }) => {
        if ($disabled) return '';
        if ($accordion) return $selected ? theme.cores.primariaClara : '#eee';
        return $selected ? theme.cores.primariaClara : theme.cores.fundo;
    }};
    border-color: ${({ theme, $disabled, $accordion }) => ($accordion && !$disabled) ? theme.cores.primaria : ''};
  }

  &::after {
    content: '${({ $selected }) => $selected ? '✓' : ''}';
    font-size: 16px;
    font-weight: 900;
  }
`;

export const Select = ({ value, onChange, children, placeholder, accordion = false, ...rest }) => {
    const [isOpen, setIsOpen] = useState(accordion); // Se for accordion, pode começar aberto ou controlado
    const wrapperRef = useRef(null);

    const options = React.Children.map(children, child => {
        if (child.type === 'option') {
            return {
                value: child.props.value,
                label: child.props.children,
                disabled: child.props.disabled
            };
        }
        return null;
    }).filter(Boolean);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        if (accordion) return;
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [accordion]);

    const handleSelect = (opt) => {
        if (opt.disabled) return;
        if (onChange) {
            onChange({ target: { value: opt.value } });
        }
        if (!accordion) setIsOpen(false);
    };

    return (
        <SelectWrapper ref={wrapperRef} {...rest}>
            {!accordion && (
                <SelectTrigger $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                    {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
                </SelectTrigger>
            )}
            {(isOpen || accordion) && (
                <DropdownList $accordion={accordion}>
                    {options.map(opt => (
                        <OptionItem
                            key={opt.value}
                            $accordion={accordion}
                            $selected={String(opt.value) === String(value)}
                            $disabled={opt.disabled}
                            onClick={() => handleSelect(opt)}
                        >
                            {opt.label}
                        </OptionItem>
                    ))}
                </DropdownList>
            )}
        </SelectWrapper>
    );
};
