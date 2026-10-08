'use strict';

const { Notice, Plugin } = require('obsidian');

function parseCoordinateValue(raw) {
  if (!/^\d+(?:[\s-]+\d+)*$/.test(raw)) {
    return null;
  }

  if (/[\s-]/.test(raw)) {
    return raw
      .split(/[\s-]+/)
      .map((segment) => Number.parseInt(segment, 10));
  }

  // Preserve the original compact-coordinate behavior: 111 means 1-1-1.
  return raw.split('').map((digit) => Number.parseInt(digit, 10));
}

function parseCoordinate(line, allowLegacySuffix) {
  const trimmedLine = line.trimEnd();
  const markerIndex = trimmedLine.lastIndexOf('//');

  if (markerIndex !== -1) {
    const raw = trimmedLine.slice(markerIndex + 2).trim();
    return parseCoordinateValue(raw);
  }

  if (!allowLegacySuffix) {
    return null;
  }

  // A coordinate-only line is unambiguous, even in legacy mode.
  const coordinateOnly = parseCoordinateValue(trimmedLine);
  if (coordinateOnly) {
    return coordinateOnly;
  }

  const match = trimmedLine.match(/(\d+(?:-\d+)*)$/);
  if (!match) {
    return null;
  }

  return parseCoordinateValue(match[1]);
}

function compareCoordinates(left, right) {
  const maxLength = Math.max(left.length, right.length);

  for (let i = 0; i < maxLength; i += 1) {
    const leftValue = left[i];
    const rightValue = right[i];

    if (leftValue === undefined) return -1;
    if (rightValue === undefined) return 1;
    if (leftValue !== rightValue) return leftValue - rightValue;
  }

  return 0;
}

function stripExplicitSuffix(line) {
  const trimmedLine = line.trimEnd();
  const markerIndex = trimmedLine.lastIndexOf('//');

  if (markerIndex === -1) {
    return line;
  }

  const raw = trimmedLine.slice(markerIndex + 2).trim();
  if (!parseCoordinateValue(raw)) {
    return line;
  }

  return trimmedLine.slice(0, markerIndex).trimEnd();
}

function sortLines(lines) {
  const hasExplicitCoordinates = lines.some((line) => {
    const trimmedLine = line.trimEnd();
    const markerIndex = trimmedLine.lastIndexOf('//');

    if (markerIndex === -1) {
      return false;
    }

    const raw = trimmedLine.slice(markerIndex + 2).trim();
    return parseCoordinateValue(raw) !== null;
  });

  const sortable = lines.map((text, index) => ({
    text,
    index,
    coordinate: parseCoordinate(text, !hasExplicitCoordinates),
  }));

  sortable.sort((left, right) => {
    if (left.coordinate && right.coordinate) {
      const comparison = compareCoordinates(left.coordinate, right.coordinate);

      if (comparison !== 0) {
        return comparison;
      }

      return left.index - right.index;
    }

    if (left.coordinate) {
      return -1;
    }

    if (right.coordinate) {
      return 1;
    }

    const textComparison = left.text.localeCompare(right.text, undefined, {
      sensitivity: 'base',
    });

    if (textComparison !== 0) {
      return textComparison;
    }

    return left.index - right.index;
  });

  return sortable.map((entry) => entry.text);
}

function sortSelection(editor, removeSuffix) {
  const selectedText = editor.getSelection();

  if (!selectedText.trim()) {
    new Notice('Select one or more lines to sort.');
    return;
  }

  const lines = selectedText.split(/\r?\n/);
  const sorted = sortLines(lines);
  const output = removeSuffix
    ? sorted.map((line) => stripExplicitSuffix(line))
    : sorted;

  editor.replaceSelection(output.join('\n'));
}

module.exports = class FourListsPlugin extends Plugin {
  async onload() {
    this.addCommand({
      // Keep the original command id so existing hotkeys continue to work.
      id: 'sort-lines-by-end-number',
      name: 'Sort Lines by End Coordinate',
      editorCallback: (editor) => {
        sortSelection(editor, false);
      },
    });

    this.addCommand({
      id: 'sort-lines-by-end-coordinate-and-remove-suffix',
      name: 'Sort Lines by End Coordinate and Remove // Suffix',
      editorCallback: (editor) => {
        sortSelection(editor, true);
      },
    });
  }
};
