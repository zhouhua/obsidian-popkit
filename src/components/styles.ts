import styled from '@emotion/styled';

export const PopoverContainer = styled.div<{ type: 'normal' | 'setting'; }>`
  position: ${porps => (porps.type === 'normal' ? 'absolute' : 'static')};
  border-radius: 6px;
  background-color: #000;
  overflow: hidden;
  max-width: 100%;
  display: ${porps => (porps.type === 'normal' ? 'block' : 'flex')};
  flex-wrap: wrap;
  ul {
    display: flex;
    max-width: 100%;
    flex-wrap: wrap;
  }
  ul, li {
    list-style: none;
    padding: 0 !important;
    margin: 0;
    display: flex;
  }
`;

export const Devider = styled.div`
  width: 1px;
  margin: 6px 4px;
  background-color: #fff;
  height: 16px;
`;

export const Alert = styled.span`
  font-size: 12px;
  padding: 0 12px;
  line-height: 28px;
`;

export const Li = styled.li`
  &::before {
    content: none !important;
  }
`;
