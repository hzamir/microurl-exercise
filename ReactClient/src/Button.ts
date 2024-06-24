import styled from 'styled-components';

export const Button = styled.button`
    background: #34d937;
    background-image: linear-gradient(to bottom, #34d937, #2fb82b);
    border-radius: 15px;
    //font-family: Arial;
    color: white;
    font-size: 15px;
    padding: 10px 20px 10px 20px;
    text-decoration: none;
    margin: 5px;
  &:hover {
    background: #3cb0fd;
    background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
    text-decoration: none;
  }
`;

