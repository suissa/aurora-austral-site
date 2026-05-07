export interface TocItem {
  id: string;
  title: string;
  children?: TocItem[];
}

export const tocData: TocItem[] = [
  { id: 'intro', title: 'Introduction' },
  { id: 'goals', title: 'Design Goals' },
  { id: 'rationale', title: 'Rationale' },
  { id: 'syntax', title: 'Syntax' },
  { id: 'modules', title: 'Module System' },
  { id: 'types', title: 'Type System' },
  { id: 'linear-types', title: 'Linear Types' },
  { id: 'declarations', title: 'Declarations' },
  { id: 'statements', title: 'Statements' },
  { id: 'linearity', title: 'Linearity Checking' },
  { id: 'stdlib', title: 'Standard Library' },
  { id: 'ffi', title: 'Foreign Interfaces' },
  { id: 'style', title: 'Style Guide' },
];
