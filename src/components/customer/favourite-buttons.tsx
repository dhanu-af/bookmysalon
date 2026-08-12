"use client";

import { useState, useTransition, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavouriteSalon, toggleFavouriteBarber, isFavouriteSalon, isFavouriteBarber } from "@/lib/actions/favourites";

function FavouriteButtonBase({
  initialFavourited,
  toggle,
  className,
}: {
  initialFavourited: boolean;
  toggle: () => Promise<{ favourited?: boolean; error?: string }>;
  className?: string;
}) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("rounded-xl border-2 border-stone-300 hover:border-stone-400", className)}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggle();
          if (result.error) {
            toast.error(result.error);
            return;
          }
          setFavourited(!!result.favourited);
        })
      }
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart className={favourited ? "size-4 fill-red-500 text-red-500" : "size-4"} />
    </Button>
  );
}

export function FavouriteSalonButton({ salonId, className }: { salonId: string; className?: string }) {
  const [initial, setInitial] = useState(false);
  useEffect(() => {
    isFavouriteSalon(salonId).then(setInitial);
  }, [salonId]);
  return <FavouriteButtonBase initialFavourited={initial} toggle={() => toggleFavouriteSalon(salonId)} className={className} />;
}

export function FavouriteBarberButton({ barberId, className }: { barberId: string; className?: string }) {
  const [initial, setInitial] = useState(false);
  useEffect(() => {
    isFavouriteBarber(barberId).then(setInitial);
  }, [barberId]);
  return <FavouriteButtonBase initialFavourited={initial} toggle={() => toggleFavouriteBarber(barberId)} className={className} />;
}
