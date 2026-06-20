export type TokenType = 'text' | 'replaced' | 'token';

export interface ProcessedToken {
  type: TokenType;
  char: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputText: string;
  outputText: string;
  keySalt: string;
  randomSlider: number;
  shuffleSlider: number;
  aiSlider: number;
  injectStrategy: 'zero-width-spaces' | 'homoglyph-only' | 'mixed';
}

export interface Diagnostics {
  replacedCount: number;
  markerCount: number;
  entropyLevel: 'Низкая' | 'Средняя' | 'Максимальная';
  tokenImpact: number;
}
