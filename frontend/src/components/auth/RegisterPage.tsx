import React, { useState } from 'react';
import { authService, RegisterRequest } from '../services/auth.service';
import './RegisterPage.css';

interface RegisterPageProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ 
  onSuccess, 
  onLoginClick 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    // Подтверждение пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Имя
    if (!formData.name) {
      newErrors.name = 'Имя обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registerRequest: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
      };

      await authService.register(registerRequest);

      setSubmitMessage('✅ Регистрация успешна! Теперь вы можете войти.');
      
      // Очищаем форму
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
      });

      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        onSuccess?.();
        onLoginClick?.();
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      setSubmitMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">Регистрация в SportLink</h1>
        <p className="register-subtitle">
          Найдите партнёров для спортивных игр рядом с вами
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Иван Иванов"
              disabled={isSubmitting}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ivan@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон (необязательно)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          {submitMessage && (
            <div className={`submit-message ${submitMessage.startsWith('❌') ? 'error' : 'success'}`}>
              {submitMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-link">
          Уже есть аккаунт?{' '}
          <button 
            type="button" 
            onClick={onLoginClick}
            className="link-button"
          >
            Войти
          </button>
        </div>

        <div className="registration-flow-info">
          <h3>📋 Как это работает:</h3>
          <ol>
            <li>Зарегистрируйтесь в системе</li>
            <li>Войдите под своими учётными данными</li>
            <li>Заполните спортивный профиль (виды спорта, уровень)</li>
            <li>Найдите партнёров или создайте матч!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
