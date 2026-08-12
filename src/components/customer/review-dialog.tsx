"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/lib/actions/reviews";
import { fraunces } from "@/lib/fonts";

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
          <DialogTitle className={fraunces.className}>Leave a review</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={n <= rating ? "size-8 fill-amber-400 text-amber-400" : "size-8 text-stone-300"} />
            </button>
          ))}
        </div>
        <Textarea placeholder="How was your appointment? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <DialogFooter>
          <button
            type="button"
            disabled={submitting}
            onClick={onSubmit}
            className="rounded-xl bg-[#7C2D3E] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
