import { getUser } from '@/auth/server'
import { prisma } from '@/db/prisma'
import React from 'react'
import AskAIButton from '@/components/AskAIButton'
import NewNoteButton from '@/components/NewNoteButton'
import NoteTextInput from '@/components/NoteTextInput'
import NoteTitleInput from '@/components/NoteTitleInput'

type Props = {
  searchParams: Promise<{[Key: string]: string | string[] | undefined}>
}

async function HomePage({searchParams}:Props) {
  const  noteIdParam  = (await searchParams).noteId
  const user = await getUser()
  const noteId = Array.isArray(noteIdParam) ? noteIdParam![0] : noteIdParam || ""
  const note = await prisma.note.findUnique({
    where: { id: noteId, authorId: user?.id },
  })
  return <div className='flex h-full flex-col items-center gap-4'>
    <div className='w-full flex max-w-4xl justify-end gap-2'>
    <AskAIButton user={user} />
    <NewNoteButton user={user} />
    </div>
    <NoteTitleInput noteId={noteId} startingTitle={note?.title || ""} />
    <NoteTextInput noteId={noteId} startingNoteText={note?.text || ""} />

    {/* <HomeToast /> */}
  </div>
  
}

export default HomePage