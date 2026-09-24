// Counter-Strike 2 Major Championship Teams & Invites (Скриншот 11)

export interface ProTeam {
  id: string;
  name: string;
  region: string;
  rank: number;
  logo: string;
  rating: string;
  stage: 'Stage 3 Invites' | 'Stage 2 Invites' | 'Stage 1 Qualifiers';
}

export const CS2_PRO_TEAMS: ProTeam[] = [
  // --- Stage 3 Invites ---
  { id: 'vitality', name: 'Team Vitality', region: 'VRS Europe', rank: 1, logo: '🐝', rating: '99/100', stage: 'Stage 3 Invites' },
  { id: 'mouz', name: 'MOUZ', region: 'VRS Europe', rank: 2, logo: '🐭', rating: '96/100', stage: 'Stage 3 Invites' },
  { id: 'spirit', name: 'Team Spirit', region: 'VRS Europe', rank: 3, logo: '🐉', rating: '98/100', stage: 'Stage 3 Invites' },
  { id: 'aurora', name: 'Aurora Gaming', region: 'VRS Europe', rank: 4, logo: '🔺', rating: '88/100', stage: 'Stage 3 Invites' },
  { id: 'navi', name: 'Natus Vincere', region: 'VRS Europe', rank: 5, logo: '⚡', rating: '97/100', stage: 'Stage 3 Invites' },
  { id: 'g2', name: 'G2 Esports', region: 'VRS Europe', rank: 6, logo: '⚔️', rating: '95/100', stage: 'Stage 3 Invites' },
  { id: 'liquid', name: 'Team Liquid', region: 'VRS Americas', rank: 7, logo: '🐴', rating: '89/100', stage: 'Stage 3 Invites' },
  { id: 'mongolz', name: 'The MongolZ', region: 'VRS Asia', rank: 8, logo: '🏹', rating: '91/100', stage: 'Stage 3 Invites' },

  // --- Stage 2 Invites ---
  { id: 'falcons', name: 'Team Falcons', region: 'VRS Europe', rank: 9, logo: '🦅', rating: '87/100', stage: 'Stage 2 Invites' },
  { id: 'faze', name: 'FaZe Clan', region: 'VRS Europe', rank: 10, logo: '🔴', rating: '94/100', stage: 'Stage 2 Invites' },
  { id: '3dmax', name: '3DMAX', region: 'VRS Europe', rank: 11, logo: '👹', rating: '84/100', stage: 'Stage 2 Invites' },
  { id: 'vp', name: 'Virtus.pro', region: 'VRS Europe', rank: 12, logo: '🐻', rating: '89/100', stage: 'Stage 2 Invites' },
  { id: 'pain', name: 'paiN Gaming', region: 'VRS Americas', rank: 13, logo: '🇵', rating: '83/100', stage: 'Stage 2 Invites' },
  { id: 'furia', name: 'FURIA', region: 'VRS Americas', rank: 14, logo: '🐆', rating: '88/100', stage: 'Stage 2 Invites' },
  { id: 'mibr', name: 'MIBR', region: 'VRS Americas', rank: 15, logo: '🇧🇷', rating: '82/100', stage: 'Stage 2 Invites' },
  { id: 'heroic', name: 'HEROIC', region: 'VRS Europe', rank: 16, logo: '🛡️', rating: '86/100', stage: 'Stage 2 Invites' },

  // --- Stage 1 Qualifiers ---
  { id: 'og', name: 'OG', region: 'European Qualifier', rank: 17, logo: '🌻', rating: '80/100', stage: 'Stage 1 Qualifiers' },
  { id: 'betboom', name: 'BetBoom Team', region: 'European Qualifier', rank: 18, logo: '🅱️', rating: '81/100', stage: 'Stage 1 Qualifiers' },
  { id: 'complexity', name: 'Complexity', region: 'North American Qualifier', rank: 19, logo: '⭐', rating: '83/100', stage: 'Stage 1 Qualifiers' },
  { id: 'tyloo', name: 'TYLOO', region: 'Chinese Qualifier', rank: 20, logo: '🐲', rating: '79/100', stage: 'Stage 1 Qualifiers' },
];
