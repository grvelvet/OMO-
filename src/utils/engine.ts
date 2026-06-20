import { ProcessedToken, Diagnostics, TokenType } from '../types';

// Статические регулярные выражения для максимальной производительности
const RE_SHUFFLE_SPLIT = /(\p{L}+|[^\p{L}]+)/gu;
const RE_IS_WORD = /^\p{L}+$/u;
const RE_WORD_OR_NUM = /\p{L}|\p{N}/u;

export const characterMatrix: Record<string, string[]> = {
  // Кириллица -> омоглифы
  'А': ['A', 'Α', '0', 'А'],
  'В': ['B', 'Β', '1'],
  'Г': ['Γ', 'Г'],
  'Е': ['E', 'Ε', 'Е'],
  'З': ['3', 'З'],
  'К': ['K', 'Κ', 'К'],
  'Л': ['Λ', 'Л'],
  'М': ['M', 'Μ', 'М'],
  'Н': ['H', 'Η', 'Н'],
  'О': ['O', 'Ο', 'О'],
  'П': ['Π', 'П'],
  'Р': ['P', 'Ρ', 'Р'],
  'С': ['C', 'Ϲ', 'С'],
  'Т': ['T', 'Τ', 'Т'],
  'У': ['Y', 'У'],
  'Х': ['X', 'Χ', 'Х'],
  'Ч': ['4', 'Ч'],

  'а': ['a', 'а'],
  'б': ['6', 'б'],
  'в': ['b', 'в'],
  'г': ['r', 'г'],
  'д': ['g', 'д'],
  'е': ['e', 'е'],
  'з': ['3', 'з'],
  'и': ['u', 'и'],
  'к': ['k', 'к'],
  'м': ['m', 'м'],
  'н': ['h', 'н'],
  'о': ['o', 'ο', 'о'],
  'п': ['n', 'п'],
  'р': ['p', 'р'],
  'с': ['c', 'ϲ', 'с'],
  'т': ['τ', 'т'],
  'у': ['y', 'у'],
  'х': ['x', 'х'],
  'ч': ['4', 'ч'],
  'ш': ['ɯ', 'ш'],

  // Латиница -> омоглифы
  'A': ['А', 'Α', 'A'],
  'B': ['В', 'Β', 'B'],
  'C': ['С', 'Ϲ', 'C'],
  'E': ['Е', 'Ε', 'E'],
  'F': ['Ғ', 'Ϝ', 'F'],
  'G': ['Ԍ', 'G'],
  'H': ['Н', 'Η', 'H'],
  'I': ['І', 'Ι', 'Ⅰ', 'I'],
  'J': ['Ј', 'J'],
  'K': ['К', 'Κ', 'K'],
  'L': ['Լ', 'Ⅼ', 'L'],
  'M': ['М', 'Μ', 'Ⅿ', 'M'],
  'N': ['Ν', 'N'],
  'O': ['О', 'Ο', 'O'],
  'P': ['Р', 'Ρ', 'P'],
  'S': ['Ѕ', 'S'],
  'T': ['Т', 'Т', 'T'],
  'V': ['Ѵ', 'V'],
  'W': ['Ԝ', 'W'],
  'X': ['Х', 'Χ', 'Ⅹ', 'X'],
  'Y': ['Ү', 'Υ', 'Y'],
  'Z': ['Ζ', 'Z'],

  'a': ['а', 'a'],
  'c': ['с', 'ϲ', 'c'],
  'd': ['ԁ', 'd'],
  'e': ['е', 'e'],
  'h': ['һ', 'հ', 'h'],
  'i': ['і', 'ⅰ', 'i'],
  'j': ['ј', 'j'],
  'k': ['к', 'k'],
  'l': ['ⅼ', 'ӏ', 'l'],
  'n': ['ո', 'n'],
  'o': ['о', 'ο', 'o'],
  'p': ['р', 'p'],
  'q': ['ԛ', 'q'],
  's': ['ѕ', 's'],
  'u': ['ս', 'u'],
  'v': ['ѵ', 'ν', 'v'],
  'w': ['ԝ', 'w'],
  'x': ['х', 'ⅹ', 'x'],
  'y': ['у', 'y'],

  // Немецкие уникальные спецсимволы -> омоглифы
  'ä': ['ӓ'],
  'Ä': ['Ӓ'],
  'ö': ['ӧ'],
  'Ö': ['Ӧ'],
  'ü': ['ӱ'],
  'Ü': ['Ӱ'],
  'ß': ['β', 'ϐ'],

  // Французские, испанские, итальянские умлауты и акценты
  'è': ['ѐ'],
  'È': ['Ѐ'],
  'ë': ['ё'],
  'Ë': ['Ё'],
  'ï': ['ї'],
  'Ï': ['Ї'],
  'æ': ['ӕ'],
  'Æ': ['Ӕ'],

  // Символы с диакритикой, собираемые через Combining Diacritical Marks
  'á': ['а\u0301'],
  'é': ['е\u0301'],
  'í': ['і\u0301'],
  'ó': ['о\u0301'],
  'ú': ['у\u0301'],
  'à': ['а\u0300'],
  'ù': ['у\u0300'],
  'â': ['а\u0302'],
  'ê': ['е\u0302'],
  'î': ['і\u0302'],
  'ô': ['о\u0302'],
  'û': ['у\u0302'],
  'ÿ': ['у\u0308'],
  'ç': ['с\u0327'],
  'Ç': ['С\u0327']
};

export const invisiblePool = ['\u200B', '\u200C', '\u200D', '\u2060'];

// Хэш-функция FNV-1a для детерминированной генерации значений
export function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Генератор псевдослучайных чисел Mulberry32
export function mulberry32(seedCode: number): () => number {
  let a = seedCode;
  return function(): number {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getStableRandomWithHash(charIndex: number, charCode: number, saltHash: number): number {
  const seed = saltHash ^ charIndex ^ charCode;
  return mulberry32(seed)();
}

export function getStableRandom(charIndex: number, charCode: number, keySalt: string): number {
  return getStableRandomWithHash(charIndex, charCode, fnv1a(keySalt));
}

// Перемешивание слов с сохранением разметки
export function stableShuffleWords(originalText: string, rate: number, keySalt: string): string {
  // Разделяем слова и другие символы
  const matches = originalText.match(RE_SHUFFLE_SPLIT) || [];
  const tokens = matches.map((val) => ({
    value: val,
    isWord: RE_IS_WORD.test(val),
  }));

  const wordIndices: number[] = [];
  tokens.forEach((t, idx) => {
    if (t.isWord) {
      wordIndices.push(idx);
    }
  });

  const saltHash = fnv1a(keySalt || 'DEFAULT');
  const selectedIndices: number[] = [];
  wordIndices.forEach((tokenIdx, i) => {
    const wordCharCode = tokens[tokenIdx].value.charCodeAt(0) || 0;
    const rand = getStableRandomWithHash(i + 1500, wordCharCode, saltHash);
    if (rand < rate) {
      selectedIndices.push(tokenIdx);
    }
  });

  if (selectedIndices.length > 1) {
    const valuesToShuffle = selectedIndices.map((idx) => tokens[idx].value);

    for (let i = valuesToShuffle.length - 1; i > 0; i--) {
      const randVal = getStableRandomWithHash(i + 3500, i, saltHash);
      const j = Math.floor(randVal * (i + 1));
      const temp = valuesToShuffle[i];
      valuesToShuffle[i] = valuesToShuffle[j];
      valuesToShuffle[j] = temp;
    }

    selectedIndices.forEach((tokenIdx, i) => {
      tokens[tokenIdx].value = valuesToShuffle[i];
    });
  }

  return tokens.map((t) => t.value).join('');
}

export interface ObfuscationParams {
  inputText: string;
  keySalt: string;
  randomSlider: number;
  shuffleSlider: number;
  aiSlider: number;
  injectStrategy: 'zero-width-spaces' | 'homoglyph-only' | 'mixed';
}

export interface ObfuscationResult {
  rawOutputText: string;
  tokens: ProcessedToken[];
  diagnostics: Diagnostics;
}

export function obfuscateText(params: ObfuscationParams): ObfuscationResult {
  const {
    inputText,
    keySalt,
    randomSlider,
    shuffleSlider,
    aiSlider,
    injectStrategy,
  } = params;

  // Приведение к прекомпозиционной схеме (NFC)
  let text = inputText.normalize('NFC');
  const normalizedSalt = keySalt || 'DEFAULT';

  if (!text) {
    return {
      rawOutputText: '',
      tokens: [],
      diagnostics: {
        replacedCount: 0,
        markerCount: 0,
        entropyLevel: 'Низкая',
        tokenImpact: 0,
      },
    };
  }

  const shuffleRate = shuffleSlider / 100;
  if (shuffleRate > 0) {
    text = stableShuffleWords(text, shuffleRate, normalizedSalt);
  }

  const mixRate = randomSlider / 100;
  const aiRate = aiSlider / 100;

  const chars = Array.from(text);
  const processedTokens: ProcessedToken[] = [];
  const rawOutputArr: string[] = [];

  let replacedCount = 0;
  let markerCount = 0;

  const saltHash = fnv1a(normalizedSalt);
  let currentToken: ProcessedToken | null = null;

  function addToken(type: TokenType, char: string) {
    if (currentToken && currentToken.type === type) {
      currentToken.char += char;
    } else {
      if (currentToken) {
        processedTokens.push(currentToken);
      }
      currentToken = { type, char };
    }
  }

  chars.forEach((char, index) => {
    const charCode = char.charCodeAt(0) || 0;
    const matches = characterMatrix[char];
    const hasMatches = matches && matches.length > 0;

    const prob = getStableRandomWithHash(index, charCode, saltHash);
    const shouldReplace = hasMatches && prob < mixRate;

    let targetChar = char;
    let isReplaced = false;

    if (shouldReplace) {
      const variantRand = getStableRandomWithHash(index + 500, charCode, saltHash);
      const variantIdx = Math.floor(variantRand * matches.length);
      targetChar = matches[variantIdx];
      isReplaced = targetChar !== char;
    }

    if (isReplaced) {
      addToken('replaced', targetChar);
      replacedCount++;
    } else {
      addToken('text', targetChar);
    }
    rawOutputArr.push(targetChar);

    // AI Token signature break
    const isWordChar = RE_WORD_OR_NUM.test(targetChar);
    const nextChar = chars[index + 1];
    const isNextWordChar = nextChar ? RE_WORD_OR_NUM.test(nextChar) : false;

    if (isWordChar && isNextWordChar) {
      const aiProb = getStableRandomWithHash(index + 1200, charCode, saltHash);
      if (aiProb < aiRate) {
        const markerIdx = Math.floor(
          getStableRandomWithHash(index + 2400, charCode, saltHash) * invisiblePool.length
        );
        const invisibleMarker = invisiblePool[markerIdx];

        if (injectStrategy === 'zero-width-spaces' || injectStrategy === 'mixed') {
          rawOutputArr.push(invisibleMarker);
          addToken('token', invisibleMarker);
          markerCount++;
        }
      }
    }
  });

  if (currentToken) {
    processedTokens.push(currentToken);
  }

  const rawOutputText = rawOutputArr.join('');

  // Вычисление энтропии
  let entropyLevel: 'Низкая' | 'Средняя' | 'Максимальная' = 'Низкая';
  const totalMutation = replacedCount + markerCount;
  const totalChars = chars.length || 1;
  const mutationRatio = totalMutation / totalChars;

  if (mutationRatio > 0.4) {
    entropyLevel = 'Максимальная';
  } else if (mutationRatio > 0.15) {
    entropyLevel = 'Средняя';
  }

  // Влияние на ИИ-токены
  const tokenImpact = Math.min(Math.round((markerCount / totalChars) * 250), 100);

  return {
    rawOutputText,
    tokens: processedTokens,
    diagnostics: {
      replacedCount,
      markerCount,
      entropyLevel,
      tokenImpact,
    },
  };
}

export function generateSecureKey(): string {
  const array = new Uint32Array(3);
  window.crypto.getRandomValues(array);
  return Array.from(array, (val) => val.toString(36)).join('-').toUpperCase();
}
