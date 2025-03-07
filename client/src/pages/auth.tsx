import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Shield, Lock, Key } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="w-full bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Whisperbox</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your secure platform for anonymous confessions and self-destructing messages
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Authentication Card */}
          <Card className="bg-black/5">
            <CardHeader className="space-y-3">
              <div className="flex justify-center">
                <Shield className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl text-center">
                Sign in to Whisperbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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

          {/* Features Overview */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Why Sign In?</h2>

            <div className="grid gap-6">
              <div className="flex gap-4 items-start">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Manage Your Content</h3>
                  <p className="text-muted-foreground">
                    Edit or delete your confessions at any time while maintaining anonymity
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Secret Messages</h3>
                  <p className="text-muted-foreground">
                    Monitor the status of your one-time viewable messages and their expiration
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enhanced Security</h3>
                  <p className="text-muted-foreground">
                    Additional security features for your sensitive content while maintaining anonymity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}