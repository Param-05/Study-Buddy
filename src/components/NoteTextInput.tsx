'use client'

import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { Textarea } from './ui/textarea'
import { debounceTimeout } from '@/lib/constants'
import useNote from '@/hooks/useNote'
import { updateNoteAction } from '@/actions/notes'

type Props = {
    noteId: string
    startingNoteText: string
}

let updateTimeout: NodeJS.Timeout

function NoteTextInput( {noteId, startingNoteText}: Props) {
    const noteIdParam = useSearchParams().get('noteId') || ""
    const {noteText, setNoteText} = useNote() // This is a custom hook that we will create in the next step

    useEffect(() => {
        if (noteIdParam === noteId) {
            setNoteText(startingNoteText)
        }
    }, [startingNoteText, noteIdParam, noteId, setNoteText])
    
    const handleUpdateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        setNoteText(text)

        clearTimeout(updateTimeout)
        updateTimeout = setTimeout(() => {
            updateNoteAction(noteId, text)
        }, debounceTimeout)
    }
  return (
    <Textarea
    value={noteText}
    onChange={handleUpdateNote}
    placeholder='Type your notes here...'
    className='custom-scrollbar max-w-4xl h-full mb-4 resize-none border p-4 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0'
     />
  )
}

export default NoteTextInput