import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterPage as RegisterPageComponent } from '../../components/auth/RegisterPage';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login');
  };

  return (
    <RegisterPageComponent 
      onSuccess={handleSuccess}
    />
  );
};

export default RegisterPage;
