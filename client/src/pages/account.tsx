import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { type Confession, type SecretMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: confessions } = useQuery<Confession[]>({
    queryKey: ["/api/my/confessions"],
    enabled: !!user,
  });

  const { data: secrets } = useQuery<SecretMessage[]>({
    queryKey: ["/api/my/secrets"],
    enabled: !!user,
  });

  async function deleteConfession(id: number) {
    try {
      await apiRequest("DELETE", `/api/confessions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/my/confessions"] });
      toast({
        title: "Success",
        description: "Confession deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete confession",
        variant: "destructive",
      });
    }
  }

  async function deleteSecret(id: number) {
    try {
      await apiRequest("DELETE", `/api/secrets/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/my/secrets"] });
      toast({
        title: "Success",
        description: "Secret message deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete secret message",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              My Account
            </h1>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">My Confessions</h2>
            {confessions?.length === 0 ? (
              <p className="text-muted-foreground">No confessions yet</p>
            ) : (
              <div className="space-y-4">
                {confessions?.map((confession) => (
                  <Card key={confession.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-muted-foreground">{confession.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConfession(confession.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(confession.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">My Secret Messages</h2>
            {secrets?.length === 0 ? (
              <p className="text-muted-foreground">No secret messages yet</p>
            ) : (
              <div className="space-y-4">
                {secrets?.map((secret) => (
                  <Card key={secret.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-muted-foreground">{secret.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Status: {secret.viewed ? "Viewed" : "Not viewed"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSecret(secret.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Expires: {new Date(secret.expiresAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
