import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateSecret from "@/pages/create-secret";
import ViewSecret from "@/pages/view-secret";
import AuthPage from "@/pages/auth";
import AccountPage from "@/pages/account";
import Confession from "@/pages/create-confession";
import Feed from "./pages/feed";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create-secret" component={CreateSecret} />
      <Route path="/create-confession" component={Confession}/>
      <Route path="/view/:token" component={ViewSecret} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/feed" component={Feed}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
