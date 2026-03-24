import React, { useState } from 'react';
import { authService } from '../../services/auth.service';
import './ProfileSetupPage.css';

export interface SportInfo {
  sport: string;
  level: number; // 1-3: 1=Новичок, 2=Средний, 3=Продвинутый
  description?: string;
}

interface ProfileSetupPageProps {
  onComplete?: () => void;
}

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    city: '',
    description: '',
    sports: [] as SportInfo[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sportOptions = [
    { value: 'FOOTBALL', label: '⚽ Футбол' },
    { value: 'TENNIS', label: '🎾 Теннис' },
    { value: 'BASKETBALL', label: '🏀 Баскетбол' },
    { value: 'VOLLEYBALL', label: '🏐 Волейбол' },
    { value: 'HOCKEY', label: '🏒 Хоккей' },
  ];

  const levelOptions = [
    { value: 1, label: 'Новичок', description: 'Только начал заниматься' },
    { value: 2, label: 'Средний', description: 'Регулярно играю' },
    { value: 3, label: 'Продвинутый', description: 'Опытный игрок' },
  ];

  const addSport = () => {
    setFormData(prev => ({
      ...prev,
      sports: [...prev.sports, { sport: '', level: 1, description: '' }],
    }));
  };

  const removeSport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));
  };

  const updateSport = (index: number, field: keyof SportInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.map((sport, i) => 
        i === index ? { ...sport, [field]: value } : sport
      ),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.city.trim()) {
      setError('Укажите город');
      return false;
    }

    if (formData.sports.length === 0) {
      setError('Добавьте хотя бы один вид спорта');
      return false;
    }

    for (const sport of formData.sports) {
      if (!sport.sport) {
        setError('Выберите вид спорта');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/profiles/my', {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          city: formData.city,
          description: formData.description,
          sports: formData.sports.map(s => ({
            sport: s.sport,
            level: s.level,
            description: s.description,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка сохранения профиля');
      }

      // Профиль успешно заполнен
      authService.setProfileSetupRequired(false);
      onComplete?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <h1 className="setup-title">Заполнение профиля</h1>
        <p className="setup-subtitle">
          Расскажите о себе, чтобы другие игроки могли найти вас
        </p>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-section">
            <h2>📍 Местоположение</h2>
            
            <div className="form-group">
              <label htmlFor="city">Город *</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Москва"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>🏅 Виды спорта</h2>
            
            {formData.sports.map((sport, index) => (
              <div key={index} className="sport-item">
                <div className="sport-header">
                  <span>Вид спорта #{index + 1}</span>
                  {formData.sports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSport(index)}
                      className="remove-button"
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="sport-fields">
                  <div className="form-group">
                    <label>Вид спорта *</label>
                    <select
                      value={sport.sport}
                      onChange={(e) => updateSport(index, 'sport', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="">Выберите вид спорта</option>
                      {sportOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Уровень *</label>
                    <select
                      value={sport.level}
                      onChange={(e) => updateSport(index, 'level', parseInt(e.target.value))}
                      disabled={isSubmitting}
                    >
                      {levelOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание (необязательно)</label>
                  <textarea
                    value={sport.description || ''}
                    onChange={(e) => updateSport(index, 'description', e.target.value)}
                    placeholder="Например: играю по выходным, ищу партнёра для тренировок"
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSport}
              className="add-sport-button"
              disabled={isSubmitting}
            >
              + Добавить вид спорта
            </button>
          </div>

          <div className="form-section">
            <h2>📝 О себе</h2>
            
            <div className="form-group">
              <label htmlFor="description">Био (необязательно)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Расскажите о своём спортивном опыте, предпочтениях..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить профиль'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
