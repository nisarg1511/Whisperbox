import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Save, Trash2, X, UserCircle2, Clock, Key } from "lucide-react";
import { Link } from "wouter";
import { type Confession, type SecretMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [editingConfession, setEditingConfession] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
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

  async function updateConfession(id: number) {
    try {
      await apiRequest("PATCH", `/api/confessions/${id}`, { content: editContent });
      queryClient.invalidateQueries({ queryKey: ["/api/my/confessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      setEditingConfession(null);
      toast({
        title: "Success",
        description: "Confession updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update confession",
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="w-full bg-black text-white py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">My Dashboard</h1>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="text-white border-white hover:bg-white/10">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Dashboard Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="w-5 h-5" />
                Confessions Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{confessions?.length || 0}</p>
              <p className="text-muted-foreground">Total Confessions</p>
            </CardContent>
          </Card>

          <Card className="bg-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Secret Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{secrets?.length || 0}</p>
              <p className="text-muted-foreground">Active Messages</p>
            </CardContent>
          </Card>
        </div>

        {/* My Confessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Confessions</h2>
            <Link href="/create">
              <Button variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Create New
              </Button>
            </Link>
          </div>

          {confessions?.length === 0 ? (
            <Card className="bg-black/5">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No confessions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start sharing your thoughts anonymously
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {confessions?.map((confession) => (
                <Card key={confession.id} className="bg-black/5">
                  <CardContent className="pt-6">
                    {editingConfession === confession.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingConfession(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateConfession(confession.id)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-muted-foreground">{confession.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Posted on {new Date(confession.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingConfession(confession.id);
                              setEditContent(confession.content);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteConfession(confession.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Secret Messages */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Secret Messages</h2>
            <Link href="/create">
              <Button variant="outline" className="gap-2">
                <Key className="w-4 h-4" />
                New Secret
              </Button>
            </Link>
          </div>

          {secrets?.length === 0 ? (
            <Card className="bg-black/5">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No secret messages</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a one-time viewable message
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {secrets?.map((secret) => (
                <Card key={secret.id} className="bg-black/5">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-muted-foreground">{secret.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-muted-foreground">
                            Status: {secret.viewed ? "Viewed" : "Not viewed"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(secret.expiresAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSecret(secret.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}