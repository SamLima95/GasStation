import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Fuel, LogIn, UserPlus } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { login, register } from '@/services/auth';
import { useAuthStore } from '@/state/auth.store';
import { useToast } from '@/hooks/useToast';
import styles from './LoginPage.module.css';

const DEMO_EMAIL = 'admin@gasstation.com';
const DEMO_PASSWORD = 'Admin123!';
const DEMO_NAME = 'Admin';

export function LoginPage() {
  const { isAuthenticated, login: storeLogin } = useAuthStore();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.add('warning', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      storeLogin(res.accessToken, res.user);
      toast.add('success', 'Login realizado com sucesso');
    } catch (err: any) {
      toast.add('error', err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setDemoLoading(true);
    try {
      const res = await login(DEMO_EMAIL, DEMO_PASSWORD);
      storeLogin(res.accessToken, res.user);
      toast.add('success', 'Login demo realizado com sucesso');
    } catch {
      try {
        const regRes = await register(DEMO_NAME, DEMO_EMAIL, DEMO_PASSWORD);
        storeLogin(regRes.accessToken, regRes.user);
        toast.add('success', 'Conta demo criada e login realizado');
      } catch (regErr: any) {
        try {
          const retryRes = await login(DEMO_EMAIL, DEMO_PASSWORD);
          storeLogin(retryRes.accessToken, retryRes.user);
          toast.add('success', 'Login demo realizado com sucesso');
        } catch (finalErr: any) {
          toast.add('error', finalErr.message || 'Erro ao acessar conta demo');
        }
      }
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.branding}>
        <Fuel size={40} className={styles.logo} />
        <h1 className={styles.title}>GasStation</h1>
        <p className={styles.subtitle}>Sistema de Gestao</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={LogIn}
          className={styles.submitButton}
        >
          Entrar
        </Button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerText}>ou</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        loading={demoLoading}
        icon={UserPlus}
        onClick={handleDemo}
        className={styles.demoButton}
      >
        Conta demo
      </Button>
    </div>
  );
}
