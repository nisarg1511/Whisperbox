import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowLeft, Eye, Lock } from "lucide-react";
import { Link } from "wouter";

export default function ViewSecret() {
  const [, params] = useRoute("/view/:token");
  const { toast } = useToast();
  const [message, setMessage] = useState<{ content: string; expiresAt: string }>();
  const [error, setError] = useState<string>();
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>();

  useEffect(() => {
    if (!message?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(message.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [message?.expiresAt]);

  async function revealMessage() {
    try {
      const res = await fetch(`/api/secrets/${params?.token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }
      const data = await res.json();
      setMessage(data);
      setIsRevealed(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch secret message",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Secret Message
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              One-Time Secret Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <p className="text-lg font-semibold text-destructive">{error}</p>
              </div>
            ) : !isRevealed ? (
              <div className="space-y-4 text-center py-8">
                <Lock className="w-12 h-12 mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">
                    This message can only be viewed once
                  </p>
                  <p className="text-sm text-muted-foreground">
                    After viewing, it will be permanently deleted
                  </p>
                </div>
                <Button onClick={revealMessage} className="gap-2">
                  <Eye className="w-4 h-4" />
                  Reveal Message
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{message?.content}</p>
                </div>
                {timeLeft && (
                  <p className="text-sm text-muted-foreground text-center">
                    Expires in: {timeLeft}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
