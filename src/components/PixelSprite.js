import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../theme/colors';

// A tiny 8x10 pixel-art fighter built from a grid. `skin` tints the body,
// `flip` mirrors it so the two fighters face each other.
// Grid legend: 0 empty, 1 hair/dark, 2 skin, 3 body(colour), 4 fist
const GRID = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 1, 2, 1, 2, 0], // eyes
  [0, 0, 2, 2, 2, 2, 0, 0],
  [4, 3, 3, 3, 3, 3, 3, 0], // arm + body
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 0, 2, 0, 0, 2, 0, 0], // legs
  [0, 1, 1, 0, 0, 1, 1, 0], // shoes
];

const PIX = 7;
const COLS = 8;
const ROWS = GRID.length;

const PALETTE = {
  1: colors.dark,
  2: '#F1C9A5',
  4: '#F1C9A5',
};

export default function PixelSprite({ skin = colors.purple, flip = false, scale = 1 }) {
  const w = COLS * PIX;
  const h = ROWS * PIX;
  return (
    <Svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`}>
      {GRID.map((row, r) =>
        row.map((cell, c) => {
          if (cell === 0) return null;
          const fill = cell === 3 ? skin : PALETTE[cell];
          const x = flip ? (COLS - 1 - c) * PIX : c * PIX;
          return (
            <Rect key={`${r}-${c}`} x={x} y={r * PIX} width={PIX} height={PIX} fill={fill} />
          );
        })
      )}
    </Svg>
  );
}
