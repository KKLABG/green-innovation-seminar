/* Split each scene's sheet into separate type planes. Text nodes are moved, never rewritten. */

function plane(role, nodes, width, opts) {
  const list = (nodes || []).filter(Boolean);
  if (!list.length) throw new Error("empty plane " + role);
  const el = document.createElement("div");
  const glass = !!(opts && opts.glass);
  const scroll = !!(opts && opts.scroll);
  el.className = "plane plane-" + role + (glass ? " is-glass" : " is-type") + (scroll ? " is-scroll" : "");
  list.forEach((node) => el.appendChild(node));
  el.style.width = width + "px";
  el.style.boxSizing = "border-box";
  el.style.background = "transparent";
  return {
    role,
    el,
    width,
    glass,
    scroll,
    maxH: (opts && opts.maxH) || 0,
    z: (opts && opts.z) || 0
  };
}

function one(sheet, sel) {
  const node = sheet.querySelector(sel);
  if (!node) throw new Error("missing " + sel);
  return node;
}

function all(sheet, sel) {
  const nodes = Array.from(sheet.querySelectorAll(sel));
  if (!nodes.length) throw new Error("missing " + sel);
  return nodes;
}

function stack(items, left, top, g) {
  let y = top;
  items.forEach((p) => {
    p.cx = left + p.pixelW / 2;
    p.cy = y + p.pixelH / 2;
    y += p.pixelH + g;
  });
  return y;
}

function rowAt(items, left, top, g) {
  let x = left;
  let h = 0;
  items.forEach((p) => {
    p.cx = x + p.pixelW / 2;
    p.cy = top + p.pixelH / 2;
    x += p.pixelW + g;
    h = Math.max(h, p.pixelH);
  });
  return { bottom: top + h, h };
}

export function buildPlanes(sheet, index) {
  const foot = () => plane("foot", [one(sheet, ".sheet-foot")], 720, { z: -0.04 });
  const title = (w, extra) => plane("title", extra || [one(sheet, "h1, h2")], w || 920, { z: 0.22 });

  if (index === 0) {
    return [
      plane("title", [one(sheet, ".kicker"), one(sheet, "h1"), one(sheet, ".short-rule")], 740, { z: 0.26 }),
      plane("lede", [one(sheet, ".lede")], 640, { z: 0.12 }),
      plane("meta", [one(sheet, ".meta")], 560, { glass: true, z: 0.02 }),
      foot()
    ];
  }
  if (index === 1) {
    const cards = all(sheet, ".cols-3 section");
    return [
      title(960),
      plane("path", [one(sheet, ".path")], 720, { z: 0.06 }),
      ...cards.map((node, n) => plane("card", [node], 760, { glass: true, z: 0.1 - n * 0.06 })),
      foot()
    ];
  }
  if (index === 2 || index === 3) {
    return [
      title(960),
      plane("prose", [one(sheet, ".prose")], 520, { glass: true, z: 0.06 }),
      plane("diagram", [one(sheet, ".diagram")], 400, { glass: true, z: 0.2 }),
      plane("closing", [one(sheet, ".closing")], 860, { z: 0.1 }),
      foot()
    ];
  }
  if (index === 4) {
    const bands = all(sheet, ".stack section");
    return [
      title(960),
      plane("quote", [one(sheet, ".pull")], 420, { z: 0.3 }),
      ...bands.map((node, n) => plane("card", [node], 500, { glass: true, z: 0.08 - n * 0.05 })),
      foot()
    ];
  }
  if (index === 5) {
    const bands = all(sheet, ".cols-2 section");
    return [
      title(960),
      plane("diagram", [one(sheet, ".diagram")], 760, { glass: true, z: 0.08 }),
      ...bands.map((node, n) => plane("card", [node], 760, { glass: true, z: n === 0 ? 0.12 : 0.02 })),
      foot()
    ];
  }
  if (index === 6) {
    const steps = all(sheet, ".timeline section");
    return [
      title(960),
      ...steps.map((node, n) => plane("card", [node], 700, { glass: true, z: 0.14 - n * 0.06 })),
      plane("quote", [one(sheet, ".pull")], 640, { z: 0.24 }),
      plane("note", [one(sheet, ".note")], 700, { glass: true, z: 0.04 }),
      foot()
    ];
  }
  if (index === 7) {
    const hyps = all(sheet, ".hyp");
    return [
      title(960),
      ...hyps.map((node, n) => plane("card", [node], 760, { glass: true, z: 0.12 - n * 0.1 })),
      foot()
    ];
  }
  if (index === 8) {
    const cards = all(sheet, ".cols-3 section");
    const model = one(sheet, ".model");
    const blurb = model.nextElementSibling;
    return [
      title(960),
      ...cards.map((node, n) => plane("card", [node], 440, { glass: true, z: 0.1 - n * 0.04 })),
      plane("note", [model, blurb], 440, { glass: true, z: 0.05 }),
      foot()
    ];
  }
  if (index === 9 || index === 12) {
    const heads = all(sheet, ":scope > h3");
    const paras = all(sheet, ":scope > p");
    return [
      title(960),
      plane("table", [heads[0], one(sheet, "table")], 760, { glass: true, z: 0.08 }),
      plane("comment", [heads[1], ...paras], 760, { glass: true, z: 0.02 }),
      foot()
    ];
  }
  if (index === 10) {
    const heads = all(sheet, ":scope > h3");
    const chips = all(sheet, ".results li");
    const notes = all(sheet, ":scope > p.note");
    const para = one(sheet, ":scope > p:not(.note)");
    return [
      title(960),
      plane("subhead", [heads[0]], 860, { z: 0.14 }),
      ...chips.map((node, n) => plane("chip", [node], 250, { glass: true, z: 0.16 - n * 0.04 })),
      plane("note", [notes[0]], 780, { glass: true, z: 0.04 }),
      plane("comment", [heads[1], para, notes[1]], 780, { glass: true, z: 0.02 }),
      foot()
    ];
  }
  if (index === 11) {
    const cards = all(sheet, ".cols-3 section");
    return [
      title(960),
      ...cards.map((node, n) => plane("card", [node], 760, { glass: true, z: 0.12 - n * 0.05 })),
      plane("note", [one(sheet, ".note")], 760, { glass: true, z: 0.02 }),
      foot()
    ];
  }
  if (index === 13) {
    const bands = all(sheet, ".stack section");
    return [
      title(960),
      ...bands.map((node, n) => plane("card", [node], 740, { glass: true, z: n === 1 ? 0.16 : 0.04 })),
      foot()
    ];
  }
  if (index === 14) {
    return [
      title(960),
      plane("lede", [one(sheet, ".lede")], 820, { z: 0.12 }),
      plane("quote", [one(sheet, ".pull"), one(sheet, ".who")], 680, { z: 0.28 }),
      plane("scroll", [
        ...all(sheet, ".compare"),
        one(sheet, ".closing"),
        one(sheet, "[data-focus='take']")
      ], 820, { glass: true, scroll: true, maxH: 520, z: 0 }),
      foot()
    ];
  }
  return [
    plane("title", [one(sheet, ".kicker"), one(sheet, "h2")], 820, { glass: true, z: 0.26 }),
    plane("lede", [one(sheet, ".lede")], 820, { glass: true, z: 0.14 }),
    plane("meta", [one(sheet, ".meta")], 640, { glass: true, z: 0.04 }),
    plane("foot", [one(sheet, ".sheet-foot")], 720, { glass: true, z: 0.02 })
  ];
}

function cover(planes) {
  stack(planes, 0, 0, 20);
}

function agenda(planes) {
  const y = stack(planes, 0, 0, 12);
  planes.forEach((p) => {
    if (p.role === "card") p.cx += 18;
  });
  return y;
}

function split(planes, diagramFirst) {
  const [title, prose, diagram, closing, foot] = planes;
  const left = diagramFirst ? diagram : prose;
  const right = diagramFirst ? prose : diagram;
  let y = stack([title], 0, 0, 16);
  const h = Math.max(left.pixelH, right.pixelH);
  left.cx = left.pixelW / 2;
  left.cy = y + left.pixelH / 2;
  right.cx = left.pixelW + 24 + right.pixelW / 2;
  right.cy = y + right.pixelH / 2;
  y += h + 16;
  y = stack([closing], 0, y, 12);
  stack([foot], 0, y, 0);
}

function theory(planes) {
  const title = planes[0];
  const quote = planes[1];
  const bands = planes.filter((p) => p.role === "card");
  const foot = planes[planes.length - 1];
  let y = stack([title], 0, 0, 16);
  quote.cx = quote.pixelW / 2;
  quote.cy = y + quote.pixelH / 2;
  const yBands = stack(bands, quote.pixelW + 28, y, 12);
  y = Math.max(y + quote.pixelH, yBands) + 16;
  stack([foot], 0, y, 0);
}

function stair(planes) {
  const title = planes[0];
  const cards = planes.filter((p) => p.role === "card");
  const rest = planes.filter((p) => p.role !== "title" && p.role !== "card");
  let y = stack([title], 0, 0, 14);
  cards.forEach((p, n) => {
    const shift = n * 36;
    p.cx = shift + p.pixelW / 2;
    p.cy = y + p.pixelH / 2;
    y += p.pixelH + 12;
  });
  stack(rest, 0, y + 6, 12);
}

function hyps(planes) {
  stack(planes, 0, 0, 22);
}

function design(planes) {
  const title = planes[0];
  const cards = planes.filter((p) => p.role === "card");
  const note = planes.find((p) => p.role === "note");
  const foot = planes[planes.length - 1];
  let y = stack([title], 0, 0, 14);
  const top = rowAt(cards.slice(0, 2), 0, y, 18);
  y = top.bottom + 16;
  const bottom = rowAt([cards[2], note], 0, y, 18);
  stack([foot], 0, bottom.bottom + 14, 0);
}

function tableStory(planes) {
  stack(planes, 0, 0, 16);
}

function results(planes) {
  const title = planes[0];
  const sub = planes.find((p) => p.role === "subhead");
  const chips = planes.filter((p) => p.role === "chip");
  const note = planes.find((p) => p.role === "note");
  const comment = planes.find((p) => p.role === "comment");
  const foot = planes[planes.length - 1];
  let y = stack([title, sub], 0, 0, 10);
  const chipRow = rowAt(chips, 0, y, 16);
  y = chipRow.bottom + 14;
  y = stack([note, comment], 0, y, 12);
  stack([foot], 0, y, 0);
}

function checks(planes) {
  stack(planes, 0, 0, 14);
}

function conclusions(planes) {
  const title = planes[0];
  const cards = planes.filter((p) => p.role === "card");
  const foot = planes[planes.length - 1];
  let y = stack([title], 0, 0, 16);
  cards.forEach((p, n) => {
    const shift = n === 1 ? 56 : 0;
    p.cx = shift + p.pixelW / 2;
    p.cy = y + p.pixelH / 2;
    y += p.pixelH + 14;
  });
  stack([foot], 0, y, 0);
}

function critique(planes) {
  stack(planes, 0, 0, 22);
}

function thanks(planes) {
  stack(planes, 0, 0, 22);
}

const ARRANGERS = [
  cover, agenda,
  (planes) => split(planes, false),
  (planes) => split(planes, true),
  theory, tableStory, stair, hyps, design,
  tableStory, results, checks, tableStory,
  conclusions, critique, thanks
];

export function arrangePlanes(index, planes) {
  const arrange = ARRANGERS[index] || cover;
  arrange(planes);
  planes.forEach((p) => {
    if (!Number.isFinite(p.cx)) p.cx = p.pixelW / 2;
    if (!Number.isFinite(p.cy)) p.cy = p.pixelH / 2;
  });
}
