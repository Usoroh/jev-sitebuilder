import { useEffect, useRef, useState } from "react";

interface SpeechResult {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}
interface SpeechEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechResult>;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function createRecognition(lang: string): Recognition | null {
  const ctor =
    (window as unknown as { SpeechRecognition?: new () => Recognition }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
  if (!ctor) return null;
  const recognition = new ctor();
  // Not continuous: a continuous session waits for a long silence before it
  // settles on a final result, and every command would reach Jev late.
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;
  return recognition;
}

/** Press to talk. Calls `onFinal` once the speaker stops. */
export function useVoice(onFinal: (transcript: string) => void, lang: string) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const handlerRef = useRef(onFinal);
  handlerRef.current = onFinal;
  /** What has been heard so far, in case the key goes up before the final. */
  const heard = useRef("");

  const supported = typeof window !== "undefined" && createRecognition(lang) !== null;

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function start() {
    if (recognitionRef.current) return;
    const recognition = createRecognition(lang);
    if (!recognition) return;
    recognitionRef.current = recognition;
    heard.current = "";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
      heard.current = text;
      setInterim(text);
      if (event.results[event.results.length - 1].isFinal) {
        heard.current = "";
        setInterim("");
        const said = text.trim();
        if (said) handlerRef.current(said);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
      // Letting go can beat the final result; send what was heard anyway.
      const said = heard.current.trim();
      heard.current = "";
      if (said) handlerRef.current(said);
    };
    recognition.onerror = () => {
      heard.current = "";
    };

    recognition.start();
    setListening(true);
  }

  /** Ends the utterance now, rather than waiting for silence to be noticed. */
  function stop() {
    recognitionRef.current?.stop();
  }

  return { listening, interim, supported, start, stop };
}
