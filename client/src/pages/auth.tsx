import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/5">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Shield className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl text-center">
            Welcome to Whisperbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Sign in to manage your confessions and secret messages
            </p>
            <Button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90"
            >
              <SiGoogle className="w-4 h-4" />
              Sign in with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              You can still post anonymously without signing in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}