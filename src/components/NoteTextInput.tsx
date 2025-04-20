"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { debounceTimeout } from "@/lib/constants";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/actions/notes";
import { smartLookupAction } from "@/actions/ai";
import { Button } from "@/components/ui/button";

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote(); // This is a custom hook that we will create in the next step
  const [selectedText, setSelectedText] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(false);
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number }>({
    
    top: 0,
    left: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // ← Create ref

  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNoteText);
    }
  }, [startingNoteText, noteIdParam, noteId, setNoteText]);

  const handleSelectText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowButton(false);
      return;
    }
  
    const selected = selection.toString();
    if (!selected.trim()) {
      setShowButton(false);
      return;
    }
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate position relative to the viewport
    setButtonPos({
      top: rect.bottom + window.scrollY + 5, // Position below text with a small offset
      left: rect.right + window.scrollX + 5, // Position to the right with a small offset
    });
  
    setSelectedText(selected);
    setShowButton(true);
  };
  

  const handleClick = async () => {
    if (!selectedText || !textareaRef.current) return;

    try {
      const result = await smartLookupAction(selectedText);

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText =
        noteText.substring(0, start) + result + noteText.substring(end);

      setNoteText(newText);
      updateNoteAction(noteId, newText);
      setShowButton(false);
    } catch (error) {
      console.error("Failed to run smartLookupAction:", error);
    }
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteText(text);

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateNoteAction(noteId, text);
    }, debounceTimeout);
  };
  return (
    <>
      <Textarea
        ref={textareaRef}
        value={noteText}
        onChange={handleUpdateNote}
        onMouseUp={handleSelectText}
        placeholder="Type your notes here..."
        className="custom-scrollbar placeholder:text-muted-foreground mb-4 h-full max-w-4xl resize-none border p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {showButton && (
        <Button
          className="absolute left-2 z-10 rounded bg-blue-500 p-2 text-sm text-white shadow"
          style={{ position:'absolute', top: buttonPos.top, left: buttonPos.left }}
          onClick={handleClick}
      
        >
          Ask AI
        </Button>
      )}
    </>
  );
}

export default NoteTextInput;
