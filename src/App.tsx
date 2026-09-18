import { useEffect, useRef, useState } from "react";
import { CATALOG, type BlockId } from "@/blocks/catalog";
import { decide, JevError, PRICE_PER_INPUT_TOKEN, type Decision, type Intent, type Target, type Turn } from "@/lib/jev";
import { PALETTE, type ColorId, type ColorPart } from "@/lib/palette";
import { insertBeside, LAYOUT_CSS, reorder, type AlignId, type LayoutId } from "@/lib/shape";
import { applyCase, asPrice, spokenText } from "@/lib/spoken-text";
import { elementAtPath, targetAt, textNodeAtPath, type Part } from "@/lib/text-target";
import { useVoice } from "@/lib/useVoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioWaveformIcon, MicIcon, SquareCursorIcon, TrashIcon, UndoIcon } from "@/components/icons";

interface Placed {
  key: number;
  id: BlockId;
}

interface Paint {
  part: ColorPart;
  color: ColorId;
}

/** Edits keyed by "<block key>:<address>", plus the part for a colour. */
type Overrides = Record<string, string>;
type Styles = Record<string, Paint>;
/** Copies appended to a list, each naming the child it was taken from. */
type Clones = Record<string, number[]>;
/** Items taken out of a list, keyed by the item's address. */
type Hidden = Record<string, true>;
/** Where a link or button jumps to, keyed by the element's address. */
type Links = Record<string, BlockId>;

/** Size, spacing, layout, alignment and order, keyed "<block>:<address>:<kind>". */
type PropEdit =
  | { kind: "size"; steps: number }
  | { kind: "space"; steps: number }
  | { kind: "layout"; layout: LayoutId }
  | { kind: "align"; align: AlignId }
  | { kind: "order"; sequence: number[] };
type Props = Record<string, PropEdit>;

interface Page {
  blocks: Placed[];
  overrides: Overrides;
  styles: Styles;
  clones: Clones;
  hidden: Hidden;
  props: Props;
  links: Links;
}

/** Where the cursor points, resolved against what is on the page. */
interface Pointer extends Target {
  y: number;
  overIndex: number | null;
  /** Key of the block the edit lands in. */
  targetKey: number | null;
  textPath: string | null;
  elementPath: string | null;
  surfacePath: string | null;
  itemPath: string | null;
  listPath: string | null;
  spacedPath: string | null;
  rowPath: string | null;
  columnPaths: string[];
  listLength: number;
  textRect: { top: number; left: number; width: number; height: number } | null;
}

type Language = "en-US" | "ru-RU";
const LANGUAGES: Record<Language, { next: Language; label: string; spoken: string }> = {
  "en-US": { next: "ru-RU", label: "EN", spoken: "English" },
  "ru-RU": { next: "en-US", label: "RU", spoken: "Russian" },
};

let nextKey = 0;
const CONFIDENCE_FLOOR = 0.6;
const EMPTY: Page = { blocks: [], overrides: {}, styles: {}, clones: {}, hidden: {}, props: {}, links: {} };

export default function App() {
  const [page, setPage] = useState<Page>(EMPTY);
  const [history, setHistory] = useState<Page[]>([]);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [pending, setPending] = useState<{ decision: Decision; pointer: Pointer } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [heard, setHeard] = useState("");
  const [did, setDid] = useState("");
  /** What this session has asked Jev for, and what it cost. */
  const [spend, setSpend] = useState({ calls: 0, input: 0, output: 0 });
  /** The last few rounds, oldest first. Jev reads these to follow a "go back". */
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [lang, setLang] = useState<Language>("en-US");
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<Pointer | null>(null);
  /** "This one too" names no amount, so a repeat reuses the last one asked for. */
  const lastStep = useRef({ resize: 0, respace: 0 });

  const { blocks, overrides, styles, clones, hidden, props, links } = page;
  const labels = blocks.map((block) => CATALOG[block.id].label);

  function trackPointer(event: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const nodes = Array.from(canvas.querySelectorAll<HTMLElement>("[data-block]"));

    let index = nodes.length;
    let y = 0;
    for (let i = 0; i < nodes.length; i++) {
      const rect = nodes[i].getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        index = i;
        y = rect.top - canvasRect.top + canvas.scrollTop;
        break;
      }
    }
    if (index === nodes.length) {
      // The foot of the last block, never the foot of the scroll area: the
      // indicator is positioned absolutely, so anchoring it to the scroll
      // height would push the scroll height down on every move.
      const last = nodes[nodes.length - 1];
      y = last ? last.getBoundingClientRect().bottom - canvasRect.top + canvas.scrollTop : 0;
    }
    const overIndex = nodes.findIndex((node) => {
      const rect = node.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY <= rect.bottom;
    });

    const target = targetAt(event.clientX, event.clientY, canvas);
    const previous = pointerRef.current;
    if (
      previous &&
      previous.index === index &&
      previous.overIndex === overIndex &&
      previous.textPath === (target?.textPath ?? null)
    ) {
      return;
    }

    const ownerRect = target?.owner.getBoundingClientRect();
    const overKey = overIndex === -1 ? null : (blocks[overIndex]?.key ?? null);
    const next: Pointer = {
      index,
      y,
      overIndex: overIndex === -1 ? null : overIndex,
      over: overIndex === -1 ? null : labels[overIndex],
      region: describe(index, labels),
      text: target?.text ?? null,
      item: target?.itemText ?? null,
      kind: target?.kind ?? "an empty part of the page",
      itemPath: target?.itemPath ?? null,
      rowPath: target?.rowPath ?? null,
      columnPaths: target?.columnPaths ?? [],
      listPath: target?.listPath ?? null,
      spacedPath: target?.spacedPath ?? (overIndex === -1 ? null : "0"),
      listLength: target?.listLength ?? 0,
      targetKey: target ? (blocks[nodes.indexOf(target.block)]?.key ?? null) : overKey,
      textPath: target?.textPath ?? null,
      elementPath: target?.elementPath ?? null,
      // With no text under the cursor, the block's own section takes the colour.
      surfacePath: target?.surfacePath ?? (overIndex === -1 ? null : "0"),
      textRect: ownerRect
        ? {
            top: ownerRect.top - canvasRect.top + canvas.scrollTop,
            left: ownerRect.left - canvasRect.left,
            width: ownerRect.width,
            height: ownerRect.height,
          }
        : null,
    };
    pointerRef.current = next;
    setPointer(next);
  }

  /** Keeps the last three rounds, oldest first. */
  function remember(said: string, intent: Intent, did: string) {
    setTurns((past) => [...past, { said, intent, did }].slice(-3));
  }

  function commit(next: Page) {
    setHistory((past) => [...past, page]);
    setPage(next);
  }

  function apply(result: Decision, at: Pointer, transcript: string): string {
    setNotice(null);

    const shape = (path: string | null, kind: string, edit: PropEdit, done: string): string => {
      if (at.targetKey === null || path === null) {
        setNotice("Point at part of a section first.");
        return "found nothing to change under the pointer";
      }
      commit({ ...page, props: { ...props, [`${at.targetKey}:${path}:${kind}`]: edit } });
      return done;
    };

    if (result.intent === "resize") {
      const size = result.size || lastStep.current.resize;
      if (!size) return "left the size alone";
      const key = `${at.targetKey}:${at.elementPath}:size`;
      const was = props[key]?.kind === "size" ? (props[key] as { steps: number }).steps : 0;
      lastStep.current.resize = size;
      const next = Math.max(-4, Math.min(4, was + size));
      return shape(at.elementPath, "size", { kind: "size", steps: next },
        size > 0 ? "made the words bigger" : "made the words smaller");
    }

    if (result.intent === "respace") {
      const space = result.space || lastStep.current.respace;
      if (!space) return "left the spacing alone";
      const key = `${at.targetKey}:${at.spacedPath}:space`;
      const was = props[key]?.kind === "space" ? (props[key] as { steps: number }).steps : 0;
      lastStep.current.respace = space;
      const next = Math.max(-3, Math.min(3, was + space));
      return shape(at.spacedPath, "space", { kind: "space", steps: next },
        space > 0 ? "opened up the spacing" : "tightened the spacing");
    }

    if (result.intent === "relayout") {
      return shape(at.listPath, "layout", { kind: "layout", layout: result.layout },
        `laid it out ${result.layout === "row" ? "in one row" : result.layout === "stacked" ? "in a column" : `${result.layout} across`}`);
    }

    if (result.intent === "realign") {
      // Lining up a row means the row, not the words the pointer happens to be on.
      const path = result.alignWhat === "group" ? (at.listPath ?? at.elementPath) : at.elementPath;
      return shape(path, "align", { kind: "align", align: result.align },
        `lined ${result.alignWhat === "group" ? "them up" : "the words"} ${result.align}`);
    }

    if (result.intent === "moveItem") {
      if (at.targetKey === null || !at.listPath || !at.itemPath) {
        setNotice("Point at one item in a list first.");
        return "found no item under the pointer";
      }
      const key = `${at.targetKey}:${at.listPath}:order`;
      const index = Number(at.itemPath.split(".").pop());
      const edit = props[key];
      const sequence = edit?.kind === "order" ? edit.sequence : null;
      return shape(at.listPath, "order",
        { kind: "order", sequence: reorder(sequence ?? [...Array(at.listLength).keys()], index, result.move) },
        `moved it ${result.move}`);
    }

    if (result.intent === "link") {
      if (at.targetKey === null || !at.elementPath) {
        setNotice("Point at the link or button first.");
        return "found nothing to point somewhere";
      }
      if (!blocks.some((block) => block.id === result.block)) {
        setNotice(`There is no ${CATALOG[result.block].label} on the page to jump to.`);
        return `there was no ${CATALOG[result.block].label} to point at`;
      }
      commit({ ...page, links: { ...links, [`${at.targetKey}:${at.elementPath}`]: result.block } });
      return `pointed it at the ${CATALOG[result.block].label}`;
    }

    if (result.intent === "insertItem") {
      if (at.targetKey === null || !at.listPath || !at.itemPath) {
        setNotice("Point at the thing you want another of.");
        return "found nothing to copy under the pointer";
      }
      const listKey = `${at.targetKey}:${at.listPath}`;
      const made = clones[listKey] ?? [];
      // The copy is appended, so it lands last; `order` then walks it round to
      // the side they asked for without moving anyone's address.
      const added = at.listLength + made.length;
      const beside = Number(at.itemPath.split(".").pop());
      const orderKey = `${at.targetKey}:${at.listPath}:order`;
      const current = props[orderKey];
      const sequence = current?.kind === "order" ? current.sequence : [...Array(added).keys()];
      commit({
        ...page,
        clones: { ...clones, [listKey]: [...made, beside] },
        props: {
          ...props,
          [orderKey]: { kind: "order", sequence: insertBeside(sequence, beside, added, result.side) },
        },
      });
      return `added one more, ${result.side === "before" ? "before" : "after"} the one pointed at`;
    }

    if (result.intent === "removeItem") {
      // A column is every cell below the one they point at, and a row is every
      // cell beside it. Anything else is the one thing under the cursor.
      const reaching =
        result.reach === "column" && at.columnPaths.length ? at.columnPaths
        : result.reach === "row" && at.rowPath ? [at.rowPath]
        : null;
      const paths = reaching ?? [at.itemPath ?? at.elementPath].filter((path) => path !== null);
      if (at.targetKey === null || paths.length === 0) {
        setNotice("Point at the part you want gone.");
        return "found nothing to take out under the pointer";
      }
      commit({
        ...page,
        hidden: { ...hidden, ...Object.fromEntries(paths.map((path) => [`${at.targetKey}:${path}`, true as const])) },
      });
      if (reaching && result.reach === "column") return `took out the column — "${at.text}"`;
      if (reaching) return "took out the whole row";
      return `took out ${at.kind}${at.text ? ` — "${at.text}"` : ""}`;
    }

    if (result.intent === "undo") {
      if (!history.length) {
        setNotice("Nothing to take back.");
        return "nothing to take back";
      }
      undo();
      return "took the last change back";
    }

    if (result.intent === "recolor") {
      const path = result.part === "text" ? at.elementPath : at.surfacePath;
      if (at.targetKey === null || path === null) {
        setNotice("Point at a section first.");
        return "could not find what they pointed at";
      }
      commit({
        ...page,
        styles: {
          ...styles,
          [`${at.targetKey}:${path}:${result.part}`]: { part: result.part, color: result.color },
        },
      });
      return summarise(result);
    }

    if (result.intent === "edit") {
      const text = spokenText(transcript);
      if (at.targetKey === null || !at.textPath) {
        setNotice("Point at a line of text first.");
        return "could not find the text they pointed at";
      }
      if (!text) {
        setNotice('Say the new words after "to".');
        return "heard no new words";
      }
      // A price has no case to get right, only a shape.
      const cased = result.format === "price" ? asPrice(text) : applyCase(text, result.textCase);
      commit({ ...page, overrides: { ...overrides, [`${at.targetKey}:${at.textPath}`]: cased } });
      return `${summarise(result)} to "${cased}"`;
    }

    // Throwing away a whole section is the most destructive thing here, so it
    // needs more than a guess behind it.
    if (result.intent === "remove" && result.confidence < CONFIDENCE_FLOOR) {
      setNotice("Not sure enough to delete a whole section. Name the one you mean.");
      return "was not sure enough to delete a section";
    }

    if (result.intent === "remove" && at.overIndex !== null) {
      const gone = at.over ?? "the section";
      commit({ ...page, blocks: blocks.filter((_, i) => i !== at.overIndex) });
      return `removed the whole ${gone}`;
    }
    const placed: Placed = { key: ++nextKey, id: result.block };
    // The cursor says where, except when the words say it plainly: pointing at
    // the middle of a section and asking for one "below" means below it, not
    // wherever the nearest gap happens to be.
    const where =
      result.side !== "unsaid" && at.overIndex !== null
        ? at.overIndex + (result.side === "after" ? 1 : 0)
        : at.index;
    if (result.intent === "replace" && at.overIndex !== null) {
      const gone = at.over ?? "the section";
      commit({ ...page, blocks: blocks.map((block, i) => (i === at.overIndex ? placed : block)) });
      return `swapped the ${gone} for ${CATALOG[result.block].label}`;
    }
    commit({ ...page, blocks: [...blocks.slice(0, where), placed, ...blocks.slice(where)] });
    return `${summarise(result)} at ${where === at.index ? at.region : `${result.side} the ${at.over}`}`;
  }

  async function run(transcript: string) {
    const at = pointerRef.current ?? {
      index: blocks.length, y: 0, overIndex: null, over: null, text: null, item: null,
      kind: "an empty part of the page", targetKey: null, textPath: null, elementPath: null,
      surfacePath: null, itemPath: null, listPath: null, spacedPath: null, listLength: 0,
      rowPath: null, columnPaths: [], textRect: null, region: describe(blocks.length, labels),
    };
    setHeard(transcript);
    setBusy(true);
    try {
      const result = await decide(transcript, at, labels, turns);
      setDecision(result);
      setSpend((so_far) => ({
        calls: so_far.calls + 1,
        input: so_far.input + result.usage.input,
        output: so_far.output + result.usage.output,
      }));
      let did: string;
      // Only a choice the command actually depends on is worth asking about.
      const choosable = result.intent === "add" || result.intent === "replace" || result.intent === "recolor";
      if (choosable && result.confidence < CONFIDENCE_FLOOR) {
        setPending({ decision: result, pointer: at });
        did = "asked them which one they meant";
      } else {
        did = apply(result, at, transcript);
      }
      setDid(did);
      remember(transcript, result.intent, did);
    } catch (error) {
      setDecision(null);
      setDid("");
      setNotice(error instanceof JevError ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const voice = useVoice(run, lang);

  // Hold space to talk. Letting go ends the utterance at once, which is why
  // this reaches Jev sooner than waiting for the microphone to notice silence.
  useEffect(() => {
    const typing = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    function down(event: KeyboardEvent) {
      if (event.code === "Escape") {
        setPending(null);
        return;
      }
      if (event.code !== "Space" || typing(event.target)) return;
      // Before the repeat check: holding the key repeats keydown, and an
      // unprevented repeat is what scrolls the page.
      event.preventDefault();
      if (event.repeat) return;
      voice.start();
    }
    function up(event: KeyboardEvent) {
      if (event.code !== "Space" || typing(event.target)) return;
      event.preventDefault();
      voice.stop();
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [voice]);

  function undo() {
    if (!history.length) return;
    setPage(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <main
        ref={canvasRef}
        onClick={(event) => {
          // A pointed link jumps within the page. The destination is looked up
          // when it is clicked, so it survives being moved or replaced.
          const marked = (event.target as HTMLElement | null)?.closest?.("[data-goto]");
          const destination = marked?.getAttribute("data-goto");
          if (!destination) return;
          event.preventDefault();
          canvasRef.current
            ?.querySelector(`[data-block="${destination}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onMouseMove={trackPointer}
        onMouseLeave={() => {
          pointerRef.current = null;
          setPointer(null);
        }}
        className="relative flex-1 overflow-y-auto"
      >
        {blocks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <SquareCursorIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-[15px] text-foreground">Point at the page, then say what belongs there.</p>
            <p className="max-w-[52ch] text-[13.5px] text-muted-foreground">
              Try "I want a nav bar here", "change the text to…", or "make the background blue".
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <BlockFrame
              key={block.key}
              blockKey={block.key}
              id={block.id}
              overrides={overrides}
              styles={styles}
              clones={clones}
              hidden={hidden}
              props={props}
              links={links}
              targeted={pointer?.overIndex === index}
            />
          ))
        )}

        {pointer?.textRect && !pending ? (
          <div
            className="pointer-events-none absolute z-10 outline-2 outline-offset-[3px] outline-ring"
            style={{
              top: pointer.textRect.top,
              left: pointer.textRect.left,
              width: pointer.textRect.width,
              height: pointer.textRect.height,
            }}
          />
        ) : null}

        {pointer && !pending ? (
          // The line has no height of its own, so it cannot stretch the canvas.
          <div className="pointer-events-none absolute inset-x-0 z-10 h-0" style={{ top: pointer.y }}>
            <div className="absolute inset-x-0 top-0 h-0.5 -translate-y-px bg-ring" />
          </div>
        ) : null}

        {pending ? (
          // Centred, not pinned to the pointer: the pointer can be at the top
          // of an empty page, and half the panel would sit off the screen.
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/20 p-4"
            onClick={() => setPending(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Jev is not sure"
              className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-popover p-5 shadow-[var(--shadow-hard-lg)]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-[13.5px] text-muted-foreground">
                Jev is {Math.round(pending.decision.confidence * 100)}% sure. Pick one.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pending.decision.intent === "recolor"
                  ? pending.decision.rankedColors.slice(0, 3).map((color) => (
                      <Button
                        key={color}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          remember(heard, pending.decision.intent, apply({ ...pending.decision, color }, pending.pointer, heard));
                          setPending(null);
                        }}
                      >
                        <span
                          className="size-3 rounded-[3px] border border-border"
                          style={{ background: `var(${PALETTE[color].css})` }}
                          aria-hidden="true"
                        />
                        {color}
                      </Button>
                    ))
                  : pending.decision.ranked.slice(0, 3).map((id) => (
                      <Button
                        key={id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          remember(heard, pending.decision.intent, apply({ ...pending.decision, block: id }, pending.pointer, heard));
                          setPending(null);
                        }}
                      >
                        {CATALOG[id].label}
                      </Button>
                    ))}
                <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="shrink-0 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button
            size="icon"
            variant={voice.listening ? "destructive" : "default"}
            onClick={voice.listening ? voice.stop : voice.start}
            disabled={!voice.supported || busy}
            aria-label={voice.listening ? "Stop listening" : "Start listening"}
          >
            {voice.listening ? (
              <AudioWaveformIcon className="size-4" aria-hidden="true" />
            ) : (
              <MicIcon className="size-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLang(LANGUAGES[lang].next)}
            aria-label={`Listening in ${LANGUAGES[lang].spoken}. Switch to ${LANGUAGES[LANGUAGES[lang].next].spoken}.`}
            title={`Speech input: ${LANGUAGES[lang].spoken}`}
          >
            <span className="font-mono text-[11px] font-medium">{LANGUAGES[lang].label}</span>
          </Button>
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!typed.trim()) return;
              void run(typed.trim());
              setTyped("");
            }}
          >
            <Input
              value={voice.listening ? voice.interim : typed}
              onChange={(event) => setTyped(event.target.value)}
              readOnly={voice.listening}
              placeholder={
                voice.listening
                  ? "Listening…"
                  : voice.supported
                    ? "Hold space to talk, or type what you want here"
                    : "Type what you want here"
              }
              aria-label="What do you want on the page"
            />
            <Button type="submit" variant="outline" disabled={busy}>
              Place
            </Button>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!history.length}
            aria-label="Undo the last change"
            title="Undo"
          >
            <UndoIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => commit(EMPTY)}
            disabled={!blocks.length}
            aria-label="Clear the page"
            title="Clear"
          >
            <TrashIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-baseline justify-between gap-4">
          {busy ? (
            <p className="text-[12.5px] text-muted-foreground">Asking Jev…</p>
          ) : notice ? (
            <p className="text-[12.5px] text-destructive">{notice}</p>
          ) : decision && did ? (
            <p className="text-[12.5px] text-muted-foreground">
              <span className="font-medium text-foreground">{sentenceCase(did)}</span> from “{heard}”,{" "}
              {Math.round(decision.confidence * 100)}% confident
            </p>
          ) : blocks.length ? (
            <p className="text-[12.5px] text-muted-foreground">
              Point at part of a section to rewrite or repaint it.
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => setSpend({ calls: 0, input: 0, output: 0 })}
            title="What this session has asked Jev for. Click to reset."
            className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground transition-colors hover:text-foreground"
          >
            {spend.calls} {spend.calls === 1 ? "call" : "calls"} · {tokens(spend.input + spend.output)} tok ·{" "}
            {money(spend.input * PRICE_PER_INPUT_TOKEN)}
          </button>
        </div>
      </footer>
    </div>
  );
}

/** Renders one block, then writes the edits into it after every render. */
function BlockFrame({
  id,
  blockKey,
  overrides,
  styles,
  clones,
  hidden,
  props,
  links,
  targeted,
}: {
  id: BlockId;
  blockKey: number;
  overrides: Overrides;
  styles: Styles;
  clones: Clones;
  hidden: Hidden;
  props: Props;
  links: Links;
  targeted: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /** Address -> the text that was there before the edit, so undo can put it back. */
  const original = useRef(new Map<string, string>());
  /** Elements this block has painted, so undo can strip the colour back off. */
  const painted = useRef(new Set<Part>());
  /** Copies appended to each list, and items taken out, for the same reason. */
  const copies = useRef(new Map<string, Part[]>());
  const dropped = useRef(new Set<Part>());
  const linked = useRef(new Set<Part>());
  /** Which properties this block has set, so a dropped edit is cleared again. */
  const shaped = useRef(new Map<Part, string[]>());
  /**
   * The value each edited property had before this block ever touched it.
   * It cannot be re-measured: these components animate, so a fresh read during
   * a transition returns a value on its way somewhere, and every render would
   * compound from that.
   */
  const bases = useRef(new Map<string, number>());
  const Block = CATALOG[id].Component;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Copies are appended, never inserted, so the addresses of the originals
    // never move under the text and colour edits already made.
    const wanted = new Map(
      Object.entries(clones)
        .filter(([key]) => Number(key.split(":")[0]) === blockKey)
        .map(([key, sources]) => [key.split(":")[1], sources]),
    );
    for (const [path, made] of copies.current) {
      if (wanted.has(path)) continue;
      for (const node of made) node.remove();
      copies.current.delete(path);
    }
    for (const [path, sources] of wanted) {
      const container = elementAtPath(root, path);
      if (!container) continue;
      const made = copies.current.get(path) ?? [];
      while (made.length > sources.length) made.pop()?.remove();
      while (made.length < sources.length) {
        const source = container.children[sources[made.length]];
        if (!source) break;
        const copy = source.cloneNode(true) as Part;
        // A copy of something taken out is still a new thing, and its place
        // comes from the order edit, not from whatever it was cloned from.
        copy.style.removeProperty("display");
        copy.style.removeProperty("order");
        container.appendChild(copy);
        made.push(copy);
      }
      copies.current.set(path, made);
    }

    // Show everything again before anything measures it: geometry read from a
    // hidden element is zero, and a size edit would bake that in.
    for (const element of dropped.current) element.style.removeProperty("display");
    dropped.current.clear();

    // Undo every shape property too, so the values read back are the originals.
    for (const [element, properties] of shaped.current) {
      for (const property of properties) element.style.removeProperty(property);
    }
    shaped.current.clear();

    const set = (element: Part, property: string, value: string) => {
      element.style.setProperty(property, value);
      shaped.current.set(element, [...(shaped.current.get(element) ?? []), property]);
    };

    // Hiding happens further down, so the page still shows what was taken out
    // while these run. Ask the edits, not the screen, what is really there.
    const gone = new Set(
      Object.keys(hidden)
        .filter((key) => Number(key.split(":")[0]) === blockKey)
        .map((key) => key.split(":")[1]),
    );

    for (const [key, edit] of Object.entries(props)) {
      const [owner, path] = key.split(":");
      if (Number(owner) !== blockKey) continue;
      const element = elementAtPath(root, path);
      if (!element) continue;
      const style = getComputedStyle(element);

      const from = (property: string, measure: () => number) => {
        const id = `${path}|${property}`;
        if (!bases.current.has(id)) bases.current.set(id, measure());
        return bases.current.get(id) ?? 0;
      };

      if (edit.kind === "size") {
        const factor = 1.18 ** edit.steps;
        if (element instanceof SVGElement) {
          const width = from("width", () => element.getBoundingClientRect().width);
          const height = from("height", () => element.getBoundingClientRect().height);
          if (width > 0) {
            set(element, "width", `${width * factor}px`);
            set(element, "height", `${height * factor}px`);
          }
        } else {
          set(element, "font-size", `${from("font-size", () => Number.parseFloat(style.fontSize)) * factor}px`);
        }
      } else if (edit.kind === "space") {
        const factor = 1.35 ** edit.steps;
        const gap = from("gap", () => Number.parseFloat(style.rowGap) || 0);
        if (gap > 0) set(element, "gap", `${gap * factor}px`);
        else {
          set(element, "padding-top", `${from("padding-top", () => Number.parseFloat(style.paddingTop)) * factor}px`);
          set(element, "padding-bottom", `${from("padding-bottom", () => Number.parseFloat(style.paddingBottom)) * factor}px`);
        }
      } else if (edit.kind === "layout") {
        for (const [property, value] of Object.entries(LAYOUT_CSS[edit.layout])) set(element, property, value);
      } else if (edit.kind === "align") {
        // Words line up with text-align; a row of cards lines up by laying the
        // cards themselves out, which text-align cannot do.
        const laidOut = style.display === "flex" || style.display === "grid";
        const here = Array.from(element.children).filter(
          (_, index) => !gone.has(path ? `${path}.${index}` : String(index)),
        );
        if (laidOut && here.length > 0) {
          const place = edit.align === "left" ? "start" : edit.align === "right" ? "end" : "center";
          if (style.display === "grid") {
            // Pin the columns to the width the cards already have, so they keep
            // their size and their row is what moves.
            const track = from("track", () => here[0].getBoundingClientRect().width);
            if (track > 0) set(element, "grid-template-columns", `repeat(${here.length}, ${track}px)`);
          } else {
            set(element, "flex-wrap", "wrap");
          }
          set(element, "justify-content", place);
        }
        set(element, "text-align", edit.align);
      } else if (edit.kind === "order") {
        // `order` only works on a flex or grid parent, so make it one.
        if (style.display !== "flex" && style.display !== "grid") {
          set(element, "display", "flex");
          set(element, "flex-direction", "column");
        }
        edit.sequence.forEach((item, place) => {
          const child = element.children[item];
          if (child instanceof HTMLElement || child instanceof SVGElement) set(child, "order", String(place));
        });
      }
    }

    for (const element of linked.current) element.removeAttribute("data-goto");
    linked.current.clear();
    for (const [key, destination] of Object.entries(links)) {
      const [owner, path] = key.split(":");
      if (Number(owner) !== blockKey) continue;
      const element = elementAtPath(root, path);
      if (!element) continue;
      element.setAttribute("data-goto", destination);
      linked.current.add(element);
    }

    for (const key of Object.keys(hidden)) {
      if (Number(key.split(":")[0]) !== blockKey) continue;
      const element = elementAtPath(root, key.split(":")[1]);
      if (!element) continue;
      element.style.display = "none";
      dropped.current.add(element);
    }

    const mine = new Map(
      Object.entries(overrides)
        .filter(([key]) => Number(key.split(":")[0]) === blockKey)
        .map(([key, text]) => [key.split(":")[1], text]),
    );
    for (const [path, text] of mine) {
      const node = textNodeAtPath(root, path);
      if (!node) continue;
      if (!original.current.has(path)) original.current.set(path, node.textContent ?? "");
      node.textContent = text;
    }
    // React will not rewrite a text child it believes is unchanged, so a
    // dropped override has to be reversed by hand.
    for (const [path, was] of original.current) {
      if (mine.has(path)) continue;
      const node = textNodeAtPath(root, path);
      if (node) node.textContent = was;
      original.current.delete(path);
    }

    for (const element of painted.current) {
      for (const property of PAINTED_PROPERTIES) element.style.removeProperty(property);
    }
    painted.current.clear();

    const paints = Object.entries(styles)
      .filter(([key]) => Number(key.split(":")[0]) === blockKey)
      .map(([key, paint]) => ({ path: key.split(":")[1], ...paint }))
      // Backgrounds first: a text colour on the same element must win.
      .sort((a, b) => (a.part === b.part ? 0 : a.part === "background" ? -1 : 1));

    for (const paint of paints) {
      const element = elementAtPath(root, paint.path);
      if (!element) continue;
      const swatch = PALETTE[paint.color];
      if (paint.part === "background") {
        element.style.backgroundColor = `var(${swatch.css})`;
        element.style.color = `var(${swatch.on})`;
        // Descendants carry their own text-foreground classes, so the readable
        // colour has to arrive as a token, not as an inherited value.
        element.style.setProperty("--foreground", `var(${swatch.on})`);
        element.style.setProperty("--card-foreground", `var(${swatch.on})`);
        element.style.setProperty("--muted-foreground", `color-mix(in oklch, var(${swatch.on}) 72%, transparent)`);
      } else {
        element.style.color = `var(${swatch.css})`;
        // Never let a colour hide the words it paints.
        if (!readable(getComputedStyle(element).color, backgroundBehind(element))) {
          element.style.color = `var(${swatch.on})`;
        }
      }
      painted.current.add(element);
    }
  });

  return (
    <div
      ref={ref}
      data-block={id}
      className={targeted ? "relative outline outline-2 -outline-offset-2 outline-ring/40" : "relative"}
    >
      <Block />
    </div>
  );
}

const PAINTED_PROPERTIES = [
  "background-color",
  "color",
  "--foreground",
  "--card-foreground",
  "--muted-foreground",
];

/**
 * Compares lightness, not full contrast: every colour in the palette is oklch,
 * so the L channel separates them well enough to catch unreadable pairs.
 * ponytail: swap in a real WCAG ratio if the palette ever grows past tokens.
 */
function readable(text: string, background: string): boolean {
  const a = lightness(text);
  const b = lightness(background);
  return a === null || b === null || Math.abs(a - b) >= 0.25;
}

function lightness(color: string): number | null {
  const oklch = color.match(/^oklch\(\s*([\d.]+)/);
  if (oklch) return Number(oklch[1]);
  const rgb = color.match(/^rgba?\(([^)]+)\)/);
  if (!rgb) return null;
  const [r, g, b] = rgb[1].split(",").map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function backgroundBehind(element: Part): string {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;
  }
  return "";
}

function tokens(count: number): string {
  return count < 1000 ? String(count) : `${(count / 1000).toFixed(1)}k`;
}

/** Fractions of a cent are the honest number here, so show them. */
function money(dollars: number): string {
  if (dollars === 0) return "$0";
  return dollars < 0.01 ? `$${dollars.toFixed(4)}` : `$${dollars.toFixed(2)}`;
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function summarise(decision: Decision): string {
  const label = CATALOG[decision.block].label;
  if (decision.intent === "recolor") {
    return `Painted the ${decision.part} ${decision.color}`;
  }
  if (decision.intent === "undo") return "Took the last change back";
  if (decision.intent === "insertItem") return "Added one more item";
  if (decision.intent === "link") return "Pointed it somewhere";
  if (decision.intent === "resize") return "Changed the size";
  if (decision.intent === "respace") return "Changed the spacing";
  if (decision.intent === "relayout") return "Changed the layout";
  if (decision.intent === "realign") return "Moved the words";
  if (decision.intent === "moveItem") return "Moved the item";
  if (decision.intent === "removeItem") return "Took one item out";
  if (decision.intent === "edit") {
    const cased = { spoken: "", sentence: "", title: " in title case", upper: " in capitals", lower: " in lower case" };
    return `Rewrote the text${cased[decision.textCase]}`;
  }
  if (decision.intent === "remove") return `Removed ${label}`;
  if (decision.intent === "replace") return `Replaced with ${label}`;
  return `Placed ${label}`;
}

/**
 * Where the pointer is, named by its neighbours. Not "the bottom": that phrase
 * reads as "the footer" and wins every request made at the end of the page,
 * however short the page is.
 */
function describe(index: number, labels: string[]): string {
  if (!labels.length) return "an empty page";
  if (index === 0) return `above the ${labels[0]}`;
  if (index >= labels.length) return `just after the ${labels[labels.length - 1]}`;
  return `between the ${labels[index - 1]} and the ${labels[index]}`;
}
