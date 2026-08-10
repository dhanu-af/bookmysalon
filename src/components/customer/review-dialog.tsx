"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/lib/actions/reviews";

export function ReviewDialog({ bookingId, open, onOpenChange }: { bookingId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    const result = await createReview(bookingId, rating, comment || undefined);
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Thanks for your review!");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={n <= rating ? "size-8 fill-amber-400 text-amber-400" : "size-8 text-muted-foreground"} />
            </button>
          ))}
        </div>
        <Textarea placeholder="How was your appointment? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <DialogFooter>
          <Button disabled={submitting} onClick={onSubmit}>
            {submitting ? "Submitting..." : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
