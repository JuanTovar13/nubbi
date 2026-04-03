import { useState } from 'preact/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../providers/UserProvider';
import { useAxios } from '../providers/AxiosProvider';
import { useToast } from '../providers/ToastProvider';
import { AuthForm } from '../components/AuthForm/AuthForm';
import { AuthInput } from '../components/AuthInput/AuthInput';
import { SubmitButton } from '../components/SubmitButton/SubmitButton';
import { Icon } from '../components/Icon/Icon';
import type { AuthData } from '../types';

export const LoginPage = () => {
  const { setAuth } = useUser();
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<AuthData>('/api/auth/login', { email, password });
      setAuth(data);
      navigate('/rooms');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al iniciar sesion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      icon={<Icon name="chat" />}
      title="Bienvenido"
      subtitle="Inicia sesion para continuar"
      footer={
        <>
          No tienes cuenta?{' '}
          <Link to="/register" class="font-medium no-underline" style={{ color: 'var(--color-primary)' }}>
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="flex flex-col gap-3">
        <AuthInput id="login-email" label="Email" type="email" placeholder="tu@email.com" value={email} onInput={setEmail} required />
        <AuthInput id="login-password" label="Contrasena" type="password" placeholder="••••••••" value={password} onInput={setPassword} required />
        <SubmitButton loading={loading} loadingText="Entrando..." text="Iniciar sesion" />
      </form>
    </AuthForm>
  );
}
