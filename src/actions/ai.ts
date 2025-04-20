"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { GoogleGenAI } from "@google/genai";

// Action: Ask AI About Notes
export const askAIAboutNotesAction = async (
  noteId: string,
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to ask AI questions");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      authorId: user.id,
    },
    select: {
      title: true,
      text: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    return "The selected note could not be found.";
  }

  const formattedNote = [
    `Title: ${note.title}`,
    `Text: ${note.text}`,
    `Created at: ${note.createdAt}`,
    `Last Updated: ${note.updatedAt}`,
  ].join("\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const contents: any[] = [
    {
      role: "user",
      parts: [
        {
          text: `
You are an AI tutor that answers questions about a user's selected note. Speak succinctly and format in clean, valid HTML (using <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>). Avoid inline styles or custom attributes.

Here is the user's selected note:
${formattedNote}
          `.trim(),
        },
      ],
    },
  ];

  // Include past Q&A context
  if (newQuestions.length > 0) {
    const history = newQuestions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${responses[i] || ""}`)
      .join("\n\n");

    contents.push({
      role: "user",
      parts: [{ text: history }],
    });
  }

  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents,
  });

  // safely get the output text
  return result.text?.replace(/```html|```/g, "").trim() || "A problem has occurred";

};


// Action: Generate MCQs
export const askAIToGenerateMCQsAction = async (
  previousAnswers: string[] = [],
  previousSolutions: string[] = [],
) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to generate MCQs");
  }

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { title: true, text: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }

  const formattedNotes = notes
    .map((note) =>
      [`Title: ${note.title}`, `Text: ${note.text}`, `Created at: ${note.createdAt}`, `Last Updated: ${note.updatedAt}`].join("\n")
    )
    .join("\n\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const messages: { role: string; content: string }[] = [
    {
      role: "developer",
      content: `
You are the AI tutor. Read these notes and generate one MCQ, then wait for the user's answer before providing the solution and moving to the next question. Format strictly in HTML (use <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>, <blockquote>). Avoid inline styles.

Here are the user's notes:
${formattedNotes}
      `,
    },
  ];

  if (previousAnswers.length > 0) {
    messages.push({
      role: "user",
      content: `
Here are the previous answers:
${previousAnswers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

And here are the previous explanations:
${previousSolutions.map((s, i) => `A${i + 1}: ${s}`).join("\n")}
      `,
    });
  }

  const result = await ai.generateContent({ messages });
  return result;
};

// Action: Smart Lookup

export const smartLookupAction = async (question: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to use Smart Lookup.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are a knowledgeable AI assistant. Provide a short, factual answer in a few words

Question: ${question}
`;

console.log("Smart Lookup Prompt:", prompt);

  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const response = result.text;
  console.log("Smart Lookup Response:", response);
  return response;
};


// Action: Generate Flashcards
export const generateFlashcardsAction = async () => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to generate flashcards.");
  }

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { title: true, text: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }

  const formattedNotes = notes
    .map((note) =>
      [`Title: ${note.title}`, `Text: ${note.text}`, `Created at: ${note.createdAt}`, `Updated at: ${note.updatedAt}`].join("\n")
    )
    .join("\n\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const messages: { role: string; content: string }[] = [
    {
      role: "developer",
      content: `
You are an AI tutor. Generate flashcards in this strict format:
--- Flashcard ---
Question: [question]
Answer: [answer]

Here are the user's notes:
${formattedNotes}
      `,
    },
  ];

  const result = await ai.generateContent({ messages });
  return result;
};

// Action: Quiz Questions
export const askQuizQuestionsAction = async (
  previousAnswers: string[] = [],
  previousFeedback: string[] = [],
) => {
  const user = await getUser();
  if (!user) {
    throw new Error("You must be logged in to take the AI quiz.");
  }

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { title: true, text: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }

  const formattedNotes = notes
    .map((note) =>
      [`Title: ${note.title}`, `Text: ${note.text}`, `Created at: ${note.createdAt}`, `Updated at: ${note.updatedAt}`].join("\n")
    )
    .join("\n\n");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const messages: { role: string; content: string }[] = [
    {
      role: "developer",
      content: `
You are the AI tutor. Ask one question at a time, then wait for the user's answer, give feedback and encouragement, and proceed to the next. Format in HTML using headings and paragraphs.

Here are the user's notes:
${formattedNotes}
      `,
    },
  ];

  if (previousAnswers.length > 0) {
    messages.push({
      role: "user",
      content: `
Previous Answers:
${previousAnswers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

Previous Feedback:
${previousFeedback.map((f, i) => `A${i + 1}: ${f}`).join("\n")}
      `,
    });
  }

  const result = await ai.generateContent({ messages });
  return result;
};
