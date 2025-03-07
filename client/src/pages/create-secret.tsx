import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertSecretMessageSchema } from "@shared/schema";
import { ArrowLeft, Clock, Copy, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function CreateSecret() {
  const { toast } = useToast();
  const [secretLink, setSecretLink] = useState<string>();
  
  const form = useForm({
    resolver: zodResolver(insertSecretMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(data: { content: string }) {
    try {
      const res = await apiRequest("POST", "/api/secrets", data);
      const { token } = await res.json();
      const link = `${window.location.origin}/view/${token}`;
      setSecretLink(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create secret message. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function copyLink() {
    if (!secretLink) return;
    await navigator.clipboard.writeText(secretLink);
    toast({
      title: "Copied!",
      description: "Secret link copied to clipboard",
    });
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
            Create Secret Message
          </h1>
        </div>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              One-Time Viewable Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {secretLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">{secretLink}</p>
                </div>
                <div className="space-y-2">
                  <Button onClick={copyLink} className="w-full gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Secret Link
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    <Clock className="w-4 h-4 inline mr-1" />
                    This message will expire in 24 hours
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Type your secret message here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Secret Message
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
