import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateGuest } from "@/hooks/use-guests";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Guest } from "@shared/schema";

const formSchema = z.object({
  attendanceStatus: z.enum(["present", "absent", "pending"]),
  wishes: z.string().optional(),
});

interface RSVPFormProps {
  guest: Guest;
}

export function RSVPForm({ guest }: RSVPFormProps) {
  const { toast } = useToast();
  const updateGuest = useUpdateGuest();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attendanceStatus: guest.attendanceStatus as "present" | "absent" | "pending" || "pending",
      wishes: guest.wishes || "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateGuest.mutate(
      { id: guest.id, ...data },
      {
        onSuccess: () => {
          toast({
            title: "RSVP Sent!",
            description: "Thank you for your response. We look forward to seeing you!",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Something went wrong. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
      <h3 className="text-2xl font-serif text-center mb-6 text-primary font-semibold">RSVP</h3>
      <p className="text-center text-muted-foreground mb-8">
        Hello, <span className="font-bold text-foreground">{guest.name}</span>! Please confirm your attendance.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="attendanceStatus"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Will you attend?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="present" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Yes, I will attend with joy!
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="absent" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Sorry, I can't make it.
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wishes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wishes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a message for the couple..."
                    className="resize-none bg-white/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 text-lg transition-all duration-300 hover:scale-[1.02]"
            disabled={updateGuest.isPending}
          >
            {updateGuest.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Send Confirmation"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
