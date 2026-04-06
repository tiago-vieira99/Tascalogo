import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Directory } from "@/pages/Directory";
import { Wishlist } from "@/pages/Wishlist";
import { Stats } from "@/pages/Stats";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center">
      <h1 className="text-6xl font-serif font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground">Página não encontrada</p>
    </div>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute><Login /></PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute><Register /></PublicRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute><Home /></ProtectedRoute>
      </Route>
      <Route path="/restaurants">
        <ProtectedRoute><Directory /></ProtectedRoute>
      </Route>
      <Route path="/wishlist">
        <ProtectedRoute><Wishlist /></ProtectedRoute>
      </Route>
      <Route path="/stats">
        <ProtectedRoute><Stats /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
