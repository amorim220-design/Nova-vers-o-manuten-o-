
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const LoginView: React.FC = () => {
  const { login, signUp } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'O formato do e-mail é inválido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setIsLoggingIn(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0D1117] p-4 font-sans">
        <div className="w-full max-w-sm">
            <div className="border border-blue-500/20 bg-slate-900/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-blue-500/10">
                <h1 className="text-3xl font-bold text-center text-white mb-2">
                    {isSignUp ? 'Crie sua Conta' : 'Bem-vindo!'}
                </h1>
                <p className="text-center text-sm text-slate-400 mb-8">
                    {isSignUp ? 'Preencha os dados para começar.' : 'Entre para acessar seus dados.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-400">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full bg-transparent border-b-2 border-slate-700 focus:border-blue-500 text-white outline-none transition-colors duration-300 p-2"
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-400">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full bg-transparent border-b-2 border-slate-700 focus:border-blue-500 text-white outline-none transition-colors duration-300 p-2"
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center !mt-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-600/20 transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-blue-800 disabled:cursor-not-allowed !mt-8"
                    >
                        {isLoggingIn ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>
            </div>
            <p className="text-center text-sm text-slate-400 mt-8">
                {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
                <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="font-semibold text-blue-500 hover:text-blue-400 ml-1 transition-colors"
                >
                    {isSignUp ? 'Entrar' : 'Cadastre-se'}
                </button>
            </p>
        </div>
    </div>
  );
};

export default LoginView;
