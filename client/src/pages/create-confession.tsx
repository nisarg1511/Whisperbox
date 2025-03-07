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

export default function Confession() {
    const { user } = useAuth();

    const form = useForm({
        resolver: zodResolver(insertConfessionSchema),
        defaultValues: {
            content: "",
        },
    });

    async function onSubmit(data: { content: string }) {
        try {
            await apiRequest("POST", "/api/confessions", data);
            form.reset();
            // Invalidate both public and user's confessions
            queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
            if (user) {
                queryClient.invalidateQueries({
                    queryKey: ["/api/my/confessions"],
                });
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
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
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
    );
}
