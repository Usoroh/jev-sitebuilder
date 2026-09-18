/**
 * Addresses one part of a block by its position in the DOM:
 * "2.0" is an element, "2.0#1" is a run of text inside that element.
 *
 * ponytail: an address is a DOM index path, so it breaks if a block's markup
 * changes. Give the blocks a content model with named fields when the builder
 * needs edits to survive a rewrite of a block.
 */

/** Anything the pointer can land on: a paragraph, a button, or an icon. */
export type Part = HTMLElement | SVGElement;

function directText(element: Element): { node: Text; index: number } | null {
  const children = Array.from(element.childNodes);
  const index = children.findIndex((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
  return index === -1 ? null : { node: children[index] as Text, index };
}

/** Child indexes from `block` down to `element`, or null if it is not inside. */
function pathFrom(element: Element, block: Element): string | null {
  const steps: number[] = [];
  let node: Element | null = element;
  while (node && node !== block) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) return null;
    steps.unshift(Array.prototype.indexOf.call(parent.children, node));
    node = parent;
  }
  return node === block ? steps.join(".") : null;
}

/** Does this element hold the room around its contents? */
function spaced(element: Element): boolean {
  const style = getComputedStyle(element);
  return (
    Number.parseFloat(style.rowGap) > 0 ||
    Number.parseFloat(style.columnGap) > 0 ||
    Number.parseFloat(style.paddingTop) > 0 ||
    Number.parseFloat(style.paddingBottom) > 0
  );
}

function paints(element: Element): boolean {
  const color = getComputedStyle(element).backgroundColor;
  return color !== "rgba(0, 0, 0, 0)" && color !== "transparent";
}

/**
 * Tag plus the tags of its children. Two list items built by the same `.map()`
 * share it; a card's header and its body do not, even though both are divs.
 */
function signature(element: Element): string {
  return `${element.tagName}:${Array.from(element.children, (child) => child.tagName).join(",")}`;
}

/**
 * One of several like it: a link among links, a card among cards.
 *
 * Siblings from the same `.map()` share a class as well as a shape, which is
 * what separates a real list from a card's own title and description. One item
 * may carry an extra class of its own (the highlighted plan), so three or more
 * of the same shape count as a list even when the classes differ.
 */
function repeated(element: Element): boolean {
  const parent = element.parentElement;
  if (!parent) return false;
  const shape = signature(element);
  const dressed = `${shape}|${element.className}`;
  let alike = 0;
  let sameShape = 0;
  for (const sibling of parent.children) {
    if (signature(sibling) !== shape) continue;
    sameShape += 1;
    if (`${shape}|${sibling.className}` === dressed) alike += 1;
  }
  return alike >= 2 || sameShape >= 3;
}

/** What sort of thing this is, in the words the questions use. */
function kindOf(element: Part): string {
  if (element instanceof SVGElement) return "an icon";
  const tag = element.tagName.toLowerCase();
  if (tag === "a") return "a link";
  if (tag === "button") return "a button";
  if (/^h[1-6]$/.test(tag)) return "a heading";
  if (tag === "li") return "one item in a list";
  if (tag === "td" || tag === "th") return "one cell in a table";
  if (tag === "tr") return "one row in a table";
  if (tag === "img") return "an image";
  if (tag === "p" || tag === "span" || tag === "blockquote") return "a line of text";
  if (tag === "section" || tag === "header" || tag === "footer" || tag === "nav") {
    return "a whole band of the section";
  }
  return "a part inside the section";
}

export interface PointerTarget {
  /** Address of the text run, or null when there are no words here. */
  textPath: string | null;
  /** Address of the element that holds the text, for a text colour. */
  elementPath: string;
  /** Address of the nearest element that paints a background, for a fill. */
  surfacePath: string;
  /** Address of the nearest element that holds room around its contents. */
  spacedPath: string;
  /** The element under the pointer, for the highlight. */
  owner: Part;
  /** The block it belongs to. */
  block: HTMLElement;
  text: string | null;
  /** Address of the nearest repeated element, and of the list holding it. */
  itemPath: string | null;
  listPath: string | null;
  /** The words in that repeated element, for the request state. */
  itemText: string | null;
  /** What the pointer is on: a link, a button, a heading, a whole band. */
  kind: string;
  /** For a table cell: the row it sits in, and its column, cell by cell. */
  rowPath: string | null;
  columnPaths: string[];
  /** How many items the list holds, for an order that covers all of them. */
  listLength: number;
}

/** What sits under the pointer: the innermost words, or the thing itself. */
export function targetAt(x: number, y: number, canvas: HTMLElement): PointerTarget | null {
  const hit = document.elementFromPoint(x, y);
  if (!hit) return null;
  // An icon is drawn from a handful of paths; the icon is the svg around them.
  const start = hit.closest("svg") ?? hit;

  let owner: Part | null = null;
  let found: { node: Text; index: number } | null = null;
  for (let element: Element | null = start; element && element !== canvas; element = element.parentElement) {
    found = directText(element);
    if (found) {
      owner = element as Part;
      break;
    }
  }
  // No words anywhere above the pointer: the thing under it is the target.
  if (!owner) owner = start as Part;

  {
    const block = owner.closest<HTMLElement>("[data-block]");
    if (!block) return null;
    const elementPath = pathFrom(owner, block);
    if (elementPath === null) return null;

    // The block's own section element is the fallback surface.
    let surface: Element | null = owner;
    while (surface && surface !== block && !paints(surface)) surface = surface.parentElement;
    const surfacePath = (surface && surface !== block ? pathFrom(surface, block) : null) ?? "0";

    // The nearest ancestor-or-self that sits among siblings of its own kind.
    let item: Element | null = owner;
    while (item && item !== block && !repeated(item)) item = item.parentElement;
    // Nothing repeats above the pointer: treat the thing itself as a list of
    // one, so it can still be copied, dropped or moved among its siblings.
    if (!item || item === block) item = owner === block ? null : owner;
    const list = item && item !== block ? item.parentElement : null;

    let room: Element | null = owner;
    while (room && room !== block && !spaced(room)) room = room.parentElement;
    const spacedPath = (room && room !== block ? pathFrom(room, block) : null) ?? "0";

    return {
      textPath: found ? `${elementPath}#${found.index}` : null,
      elementPath,
      surfacePath,
      spacedPath,
      owner,
      block,
      text: found ? (found.node.textContent?.trim() ?? "") : null,
      itemPath: item && list ? pathFrom(item, block) : null,
      listPath: list ? pathFrom(list, block) : null,
      itemText: item && list ? (item.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ?? null) : null,
      listLength: list ? list.children.length : 0,
      kind: kindOf(owner),
      ...acrossTheTable(owner, block),
    };
  }
}

/**
 * A column is not an element: it is one cell per row. Neither is a row, once
 * the pointer has landed on a cell inside it. Both are addressed here as the
 * set of cells they contain.
 */
function acrossTheTable(owner: Part, block: HTMLElement): { rowPath: string | null; columnPaths: string[] } {
  const cell = owner.closest("td, th");
  const row = cell?.closest("tr");
  const table = cell?.closest("table");
  if (!cell || !row || !table) return { rowPath: null, columnPaths: [] };

  const column = Array.prototype.indexOf.call(row.children, cell);
  const columnPaths: string[] = [];
  for (const other of table.querySelectorAll("tr")) {
    const twin = other.children[column];
    const path = twin ? pathFrom(twin, block) : null;
    if (path !== null) columnPaths.push(path);
  }
  return { rowPath: pathFrom(row, block), columnPaths };
}

/** Resolves a text address back to its node after a re-render. */
export function textNodeAtPath(block: Element, path: string): Text | null {
  const [steps, textIndex] = path.split("#");
  const element = elementAtPath(block, steps);
  const node = element?.childNodes[Number(textIndex)];
  return node?.nodeType === Node.TEXT_NODE ? (node as Text) : null;
}

/** Resolves an element address back to its element after a re-render. */
export function elementAtPath(block: Element, path: string): Part | null {
  const element = path
    .split(".")
    .filter(Boolean)
    .reduce<Element | null>((node, step) => node?.children[Number(step)] ?? null, block);
  return element instanceof HTMLElement || element instanceof SVGElement ? element : null;
}
