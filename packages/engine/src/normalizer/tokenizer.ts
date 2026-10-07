import { Token, NormalizedCode } from '../types.js';

// Reserved keywords across major languages (C++, Java, JS/TS, Python)
const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue',
  'return', 'function', 'def', 'class', 'struct', 'import', 'from', 'export', 'const',
  'let', 'var', 'public', 'private', 'protected', 'static', 'final', 'void', 'int',
  'float', 'double', 'char', 'bool', 'boolean', 'string', 'auto', 'new', 'delete',
  'try', 'catch', 'finally', 'throw', 'throws', 'yield', 'async', 'await', 'this',
  'super', 'null', 'undefined', 'true', 'false', 'None', 'True', 'False', 'in', 'is',
  'not', 'and', 'or', 'lambda', 'interface', 'type', 'enum', 'package', 'namespace'
]);

export function tokenizeAndNormalize(sourceCode: string): NormalizedCode {
  const lines = sourceCode.split(/\r?\n/);
  const tokens: Token[] = [];

  let inBlockComment = false;
  let inPythonTripleComment: string | null = null; // '"""' or "'''"

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    let line = lines[lineIdx];
    let col = 0;

    while (col < line.length) {
      // 1. Handle inside block comment
      if (inBlockComment) {
        const closeIdx = line.indexOf('*/', col);
        if (closeIdx !== -1) {
          inBlockComment = false;
          col = closeIdx + 2;
        } else {
          break; // whole remainder of line is comment
        }
        continue;
      }

      // 1b. Handle inside python triple quote docstring
      if (inPythonTripleComment) {
        const closeIdx = line.indexOf(inPythonTripleComment, col);
        if (closeIdx !== -1) {
          inPythonTripleComment = null;
          col = closeIdx + 3;
        } else {
          break;
        }
        continue;
      }

      // Skip whitespace
      if (/\s/.test(line[col])) {
        col++;
        continue;
      }

      // 2. Check for comment start
      if (line.slice(col, col + 2) === '/*') {
        inBlockComment = true;
        col += 2;
        continue;
      }
      if (line.slice(col, col + 2) === '//') {
        break; // skip rest of line
      }
      if (line[col] === '#') {
        break; // Python/shell single-line comment
      }
      if (line.slice(col, col + 3) === '"""' || line.slice(col, col + 3) === "'''") {
        inPythonTripleComment = line.slice(col, col + 3);
        col += 3;
        continue;
      }

      // 3. String literal
      if (line[col] === '"' || line[col] === "'" || line[col] === '`') {
        const quote = line[col];
        const startCol = col;
        col++;
        while (col < line.length && line[col] !== quote) {
          if (line[col] === '\\' && col + 1 < line.length) {
            col += 2;
          } else {
            col++;
          }
        }
        if (col < line.length) col++; // consume closing quote
        tokens.push({
          type: 'LITERAL_STR',
          value: '$STR',
          line: lineNum,
          column: startCol + 1,
        });
        continue;
      }

      // 4. Number literal
      if (/[0-9]/.test(line[col])) {
        const startCol = col;
        while (col < line.length && /[0-9a-fA-FxX.eE]/.test(line[col])) {
          col++;
        }
        tokens.push({
          type: 'LITERAL_NUM',
          value: '$NUM',
          line: lineNum,
          column: startCol + 1,
        });
        continue;
      }

      // 5. Identifiers or Keywords
      if (/[a-zA-Z_$]/.test(line[col])) {
        const startCol = col;
        while (col < line.length && /[a-zA-Z0-9_$]/.test(line[col])) {
          col++;
        }
        const word = line.slice(startCol, col);
        if (KEYWORDS.has(word)) {
          tokens.push({
            type: 'KEYWORD',
            value: word,
            line: lineNum,
            column: startCol + 1,
          });
        } else {
          // Normalize user-defined identifier to defeat renaming
          tokens.push({
            type: 'IDENTIFIER',
            value: '$ID',
            line: lineNum,
            column: startCol + 1,
          });
        }
        continue;
      }

      // 6. Multi-character operators
      const twoChar = line.slice(col, col + 2);
      const multiOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '->', '=>', '<<', '>>'];
      if (multiOps.includes(twoChar)) {
        tokens.push({
          type: 'OPERATOR',
          value: twoChar,
          line: lineNum,
          column: col + 1,
        });
        col += 2;
        continue;
      }

      // 7. Single character operator / punctuation
      tokens.push({
        type: 'PUNCTUATION',
        value: line[col],
        line: lineNum,
        column: col + 1,
      });
      col++;
    }
  }

  const tokenString = tokens.map((t) => t.value).join(' ');

  return {
    tokens,
    tokenString,
    sourceLines: lines,
  };
}
