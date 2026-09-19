import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
// import { usePharmacy } from '../../context/PharamcyContext';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(mobile, password);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.loginFailed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('auth.mobile')}
        type="number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        placeholder="20123456789"
        required
      />
      <Input
        label={t('auth.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" fullWidth isLoading={isLoading}>
        {t('auth.login')}
      </Button>
    </form>
  );
};
