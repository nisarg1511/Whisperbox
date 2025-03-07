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
import CreateConfession from "./create-confession";
export default function Feed() {
    const { toast } = useToast();
    const { user } = useAuth();
    const { data: confessions, isLoading } = useQuery<Confession[]>({
      queryKey: ["/api/confessions"],
    });

    return <main>
        <CreateConfession/>
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
    </main>;
}
