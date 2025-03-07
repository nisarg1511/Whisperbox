import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertConfessionSchema, type Confession } from "@shared/schema";
import { Lock, Send, Key, Shield, Clock, UserCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertConfessionSchema),
    defaultValues: {
      content: "",
    },
  });

  const { data: confessions, isLoading } = useQuery<Confession[]>({
    queryKey: ["/api/confessions"],
  });

  async function onSubmit(data: { content: string }) {
    try {
      await apiRequest("POST", "/api/confessions", data);
      form.reset();
      // Invalidate both public and user's confessions
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/my/confessions"] });
      }
      toast({
        title: "Confession posted",
        description: "Your confession has been shared anonymously.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post confession. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full bg-black text-white py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <h1 className="text-6xl font-bold">Whisperbox</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Share your thoughts anonymously. Create self-destructing messages.
            Your secrets are safe with us.
          </p>
          <div className="flex gap-4 mt-8">
            {user ? (
              <Link href="/account">
                <Button variant="outline" className="gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link href="/create">
              <Button className="gap-2">
                <Lock className="w-4 h-4" />
                Create Secret Message
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">
        {/* Feature Cards */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-black/5">
              <CardHeader>
                <Shield className="w-6 h-6 mb-2" />
                <CardTitle>Anonymous Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your thoughts without revealing your identity. No account required.
                  Perfect for those moments when you need to express yourself freely.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/5">
              <CardHeader>
                <Key className="w-6 h-6 mb-2" />
                <CardTitle>One-Time Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create messages that self-destruct after being viewed once.
                  Ideal for sharing sensitive information securely.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/5">
              <CardHeader>
                <Clock className="w-6 h-6 mb-2" />
                <CardTitle>24h Expiry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All messages automatically expire after 24 hours for extra security.
                  Your secrets won't linger forever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it Works Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Share Anonymously</h3>
              <p className="text-muted-foreground">
                Post your thoughts without revealing your identity. Your confessions are
                completely anonymous, giving you the freedom to express yourself openly.
              </p>
              <p className="text-muted-foreground">
                Optional account creation allows you to manage and track your posts
                while maintaining anonymity.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Create Secret Messages</h3>
              <p className="text-muted-foreground">
                Generate one-time viewable links to share sensitive information.
                Perfect for sharing passwords, private notes, or confidential details.
              </p>
              <p className="text-muted-foreground">
                Messages self-destruct after being viewed or within 24 hours,
                ensuring your information stays secure.
              </p>
            </div>
          </div>
        </div>

        {/* Confession Form Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Share Your Confession</h2>
          <Card className="bg-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Express Yourself
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Type your confession here..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Share Anonymously
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Confessions */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Recent Confessions</h2>
          <p className="text-muted-foreground">
            Read anonymous confessions shared by others. Your confession could be next.
          </p>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {confessions?.map((confession) => (
                <Card key={confession.id} className="bg-black/5">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">{confession.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(confession.createdAt).toLocaleDateString()}
                    </p>
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