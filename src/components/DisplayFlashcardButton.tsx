"use client";

import React, { useState, useTransition } from "react";
import { getFlashcardsForNote } from "@/actions/flashcards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Flashcard from "@/components/Flashcard"; // Tailwind-based flipping card
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Props = {
  user: User | null;
  noteId: string;
};

export default function DisplayFlashcardsButton({ user, noteId }: Props) {
  const [flashcards, setFlashcards] = useState<{ id: string; questionText: string; answerText: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // if not logged in, redirect and don’t open the dialog
      if (!user) {
        router.push("/login");
        return;
      }
      setOpen(true);
      startTransition(() => {
        getFlashcardsForNote(noteId).then((result) => {
          setFlashcards(result);
          setIndex(0);
        });
      });
    } else {
      // on close, clear out old cards
      setOpen(false);
      setFlashcards([]);
    }
  };

  const handleNext = () => {
    setIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Display Flashcards</Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-center gap-4 py-20 px-6">
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>

        {isPending && <p className="text-sm animate-pulse">Loading flashcards...</p>}

        {!isPending && flashcards.length > 0 && (
          <>
            <Flashcard
              key={index}
              question={flashcards[index].questionText}
              answer={flashcards[index].answerText}
            />
            <div className="flex justify-between items-center w-full mt-4">
              <span className="text-sm text-gray-500">
                Card {index + 1} of {flashcards.length}
              </span>
              <Button onClick={handleNext}>
                {index < flashcards.length - 1 ? "Next" : "Start Over"}
              </Button>
            </div>
          </>
        )}

        {!isPending && flashcards.length === 0 && (
          <p className="text-gray-500 text-sm mt-4">No flashcards found for this note.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
