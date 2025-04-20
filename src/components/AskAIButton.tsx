"use client";
import { User } from "@supabase/supabase-js";
import React, { Fragment, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { askAIAboutNotesAction } from "@/actions/ai";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"; // adjust path
import "@/styles/ai-response.css";

type Props = {
  user: User | null;
  noteId: string;
};

function AskAIButton({ user, noteId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const lastInputValue = useRef<string>("");

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleOnOpenChange = (isOpen: boolean) => {
    if (!user) {
      router.push("/login");
    } else {
      if (isOpen) {
        setQuestions([]);
        setResponses([]);
      }
      setOpen(isOpen);
    }
  };

  const scrollToBottom = () => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    lastInputValue.current = e.target.value;
  };

  const handleSubmit = async () => {
    const question = lastInputValue.current.trim();
    if (!question) return;

    const newQuestions = [...questions, question];
    setQuestions(newQuestions);
    lastInputValue.current = "";
    setTimeout(scrollToBottom, 100);

    startTransition(async () => {
      const response = await askAIAboutNotesAction(noteId, newQuestions, responses);
      setResponses((prev) => [...prev, response]);
      setTimeout(scrollToBottom, 100);
    });
  };


  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">Ask AI</Button>
      </DialogTrigger>
      <DialogContent
        className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto"
        ref={contentRef}
      >
        <DialogHeader>
          <DialogTitle>Ask AI About Your Notes</DialogTitle>
          <DialogDescription>
            Our AI can answer questions about all of your notes
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-8">
          {questions.map((question, index) => (
            <Fragment key={index}>
              <p className="ml-auto max-w-[60%] rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                {question}
              </p>
              {responses[index] && (
                <p
                  className="bot-response text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: responses[index] }}
                />
              )}
            </Fragment>
          ))}
          {isPending && <p className="animate-pulse text-sm">Thinking...</p>}
        </div>

        <div className="mt-auto w-full">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AskAIButton;
