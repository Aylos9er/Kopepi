"use client"; // need use client to use useRef
import {
  CopilotKit,
  DocumentPointer,
  useCopilotReadable,
  useMakeCopilotDocumentReadable,
} from "@copilotkit/react-core";
import {
  CopilotTextarea,
  HTMLCopilotTextAreaElement,
  useCopilotTextSuggestion,
} from "@copilotkit/react-textarea";
import { useRef, useState } from "react";
import { useStateWithLocalStorage } from "../utils";

export default function CopilotTextareaDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <TextAreas />
    </CopilotKit>
  );
}

const clientTranscriptSummaryDocument: DocumentPointer = {
  id: "clientTranscriptSummary",
  name: "Client Call Gong Transcript",
  sourceApplication: "Gong",
  iconImageUri: "https://asset.brandfetch.io/idHyhmcKvT/idRu6db2HA.jpeg?updated=1690987844207",
  getContents: () => {
    return "This is the client transcript summary";
  },
};

function TextAreas() {
  const [detailsText, setDetailsText] = useStateWithLocalStorage("", "cacheKey_detailsText");
  const [copilotText, setCopilotText] = useStateWithLocalStorage("", "cacheKey_copilotText");
  const [textBeforeCursor, setTextBeforeCursor] = useState("");
  const [textAfterCursor, setTextAfterCursor] = useState("");
  const { suggestion, state } = useCopilotTextSuggestion({
    textBeforeCursor,
    textAfterCursor,
    maxTokens: 5,
    stop: ["\n", ".", ","],
  });

  const [textareaPurpose, setTextareaPurpose] = useStateWithLocalStorage(
    "A COOL & SMOOTH announcement post about CopilotTextarea. No pomp, no fluff, no BS. Just the facts. Be brief, be clear, be concise. Be cool.",
    "cacheKey_textareaPurpose",
  );

  const salesReplyCategoryId = "sales_reply";
  useCopilotReadable({
    description: "Details Text",
    value: detailsText,
    categories: [salesReplyCategoryId],
  });

  const copilotTextareaRef = useRef<HTMLCopilotTextAreaElement>(null);

  useMakeCopilotDocumentReadable(clientTranscriptSummaryDocument, [salesReplyCategoryId], []);

  return (
    <div className="w-full h-full gap-10 flex flex-col items-center p-10">
      <div className="flex w-1/2 items-start gap-3">
        <span className="text-3xl text-white whitespace-nowrap">Textarea Purpose:</span>
        <textarea
          className="p-2 h-12 rounded-lg flex-grow overflow-x-auto overflow-y-hidden whitespace-nowrap"
          value={textareaPurpose}
          onChange={(event) => setTextareaPurpose(event.target.value)}
        />
      </div>
      <CopilotTextarea
        value={copilotText}
        ref={copilotTextareaRef}
        onChange={(event) => setCopilotText(event.target.value)}
        className="p-4 w-1/2 aspect-square font-bold text-3xl bg-slate-800 text-white rounded-lg resize-none"
        placeholderStyle={{
          color: "white",
          opacity: 0.5,
        }}
        autosuggestionsConfig={{
          textareaPurpose: textareaPurpose,
          contextCategories: [salesReplyCategoryId],
          chatApiConfigs: {
            suggestionsApiConfig: {
              // makeSystemPrompt: makeSystemPrompt,
              // fewShotMessages: fewShotMessages,
              maxTokens: 5,
              stop: ["\n", ".", ","],
            },
            insertionApiConfig: {},
          },
          debounceTime: 250,
        }}
      />

      <textarea
        className="p-4 w-1/2 h-80 rounded-lg"
        value={detailsText}
        placeholder="the normal textarea"
        onChange={(event) => setDetailsText(event.target.value)}
      />

      <textarea
        className="p-4 w-1/2 h-80 rounded-lg"
        placeholder="useCopilotTextSuggestion"
        onChange={(event) => {
          const target = event.target as HTMLTextAreaElement;
          const cursorPosition = target.selectionStart;
          const textBeforeCursor = target.value.substring(0, cursorPosition);
          const textAfterCursor = target.value.substring(cursorPosition);

          setTextBeforeCursor(textBeforeCursor);
          setTextAfterCursor(textAfterCursor);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab" && suggestion) {
            event.preventDefault();
            const target = event.target as HTMLTextAreaElement;
            const cursorPosition = target.selectionStart;
            const newValue =
              target.value.slice(0, cursorPosition) +
              suggestion +
              target.value.slice(cursorPosition);
            target.value = newValue;
            setTextBeforeCursor(newValue.slice(0, cursorPosition + suggestion.length));
            setTextAfterCursor(newValue.slice(cursorPosition + suggestion.length));
            target.setSelectionRange(
              cursorPosition + suggestion.length,
              cursorPosition + suggestion.length,
            );
          }
        }}
      />

      <div className="flex flex-col gap-2 bg-white w-1/2">
        <span>Text before cursor:</span>
        <span>{textBeforeCursor}</span>
        <span>Text after cursor:</span>
        <span>{textAfterCursor}</span>
        <span>Suggestion:</span>
        <span>{suggestion}</span>
      </div>

      <button
        className="p-4 w-1/2 bg-slate-800 text-white rounded-lg"
        onClick={() => {
          if (copilotTextareaRef.current) {
            copilotTextareaRef.current.focus();
          }
        }}
      >
        Focus CopilotTextarea
      </button>
    </div>
  );
}

// const makeSystemPrompt: MakeSystemPrompt = (textareaPurpose, contextString) => {
//   return `
// You are a versatile writing assistant.

// The user is writing some text.
// The purpose is: \"${textareaPurpose}\"

// Your job is to guess what the user will write next AS BEST YOU CAN.
// Only guess a SHORT distance ahead. Usually 1 sentence, or at most 1 paragraph.

// Adjust yourself to the user's style and implied intent.

// The user will provide both the text before and after the cursor. You should use this to infer what the user is likely to write next.
// <TextAfterCursor>
// <TextBeforeCursor>
// <YourSuggestion>

// If we need to add a whitespace character to the suggested text, make sure to explicitly add it in.

// The following external context is also provided. Use it to help you make better suggestions!!!
// \`\`\`
// ${contextString}
// \`\`\`
// `;
// };
