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
import { Lock, Send } from "lucide-react";
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
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Secret Confessions
          </h1>
          <div className="flex gap-2">
            {user ? (
              <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                Account
              </Button>
            ) : (
              <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            )}
            <Link href="/create">
              <Button variant="outline" className="gap-2">
                <Lock className="w-4 h-4" />
                Create Secret Message
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share Your Confession</CardTitle>
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
                          className="min-h-[100px]"
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

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Confessions</h2>
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
                <Card key={confession.id}>
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