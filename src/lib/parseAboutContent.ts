export interface AboutMember {
  name: string;
  role: string;
}

export interface ParsedAboutContent {
  lead: string;
  body: string;
  members: AboutMember[];
}

function isMembersBlock(block: string): boolean {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  const roleLines = lines.filter((line) => /[-–—]/.test(line));
  return roleLines.length >= 2 || (lines.length >= 3 && lines.every((l) => l.length < 72));
}

function parseMembers(block: string): AboutMember[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
      if (match) {
        return { name: match[1].trim(), role: match[2].trim() };
      }
      return { name: line, role: '' };
    });
}

/** Split CMS about copy into lead paragraph, body, and optional member roster block. */
export function parseAboutContent(raw: string): ParsedAboutContent {
  const blocks = raw.trim().split(/\n\n+/).filter(Boolean);
  if (blocks.length === 0) {
    return { lead: '', body: '', members: [] };
  }

  let contentBlocks = [...blocks];
  let members: AboutMember[] = [];

  const lastBlock = blocks[blocks.length - 1];
  if (isMembersBlock(lastBlock)) {
    members = parseMembers(lastBlock);
    contentBlocks = blocks.slice(0, -1);
  }

  const lead = contentBlocks[0] ?? '';
  const body = contentBlocks.slice(1).join('\n\n');

  return { lead, body, members };
}
