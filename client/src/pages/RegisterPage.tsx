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

export const RegisterPage = () => {
  const { setAuth } = useUser();
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<AuthData>('/api/auth/register', { email, password, userName });
      setAuth(data);
      navigate('/rooms');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al registrarse', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      icon={<Icon name="user-plus" />}
      title="Crear cuenta"
      subtitle="Unete y comienza a chatear"
      footer={
        <>
          Ya tienes cuenta?{' '}
          <Link to="/login" class="font-medium no-underline" style={{ color: 'var(--color-primary)' }}>
            Inicia sesion
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="flex flex-col gap-3">
        <AuthInput id="register-username" label="Nombre de usuario" type="text" placeholder="Tu nombre" value={userName} onInput={setUserName} required />
        <AuthInput id="register-email" label="Email" type="email" placeholder="tu@email.com" value={email} onInput={setEmail} required />
        <AuthInput id="register-password" label="Contrasena" type="password" placeholder="••••••••" value={password} onInput={setPassword} required />
        <SubmitButton loading={loading} loadingText="Creando cuenta..." text="Registrarse" />
      </form>
    </AuthForm>
  );
}
