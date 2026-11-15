/**
 * Draws a cast member from their `look`.
 *
 * Every character is built from the same parts in one 240 x 280 frame, so the
 * cast reads as one family: the same proportions and the same light from the
 * upper left, with different hair, faces, clothes and headwear. Colours are
 * literal, like the mascots before them: a person drawn in theme colours
 * stops looking like a person.
 *
 * Returns SVG markup built only from the constant data in app/lib/cast.ts,
 * never from user input. The mouth is grouped under class "cm" so a parent
 * can animate it while the character speaks.
 */

import type { Look } from '@/app/lib/cast'

const SKIN: Record<Look['skin'], [string, string]> = {
  1: ['#a06a47', '#875536'], 2: ['#94603f', '#7e4c30'], 3: ['#7d4b2f', '#663b23'],
  4: ['#6b3d24', '#56301b'], 5: ['#5a321d', '#45250f']
};
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = function (v: number) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); };
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
function face(w: number, chin: number): string {
  const a = 120 + w, b = 120 - w, c = 120 + w * 0.65, d = 120 - w * 0.65;
  return 'M120 64 C' + c + ' 64 ' + a + ' 86 ' + a + ' 116 C' + a + ' 146 ' + c + ' ' + (chin - 4) + ' 120 ' + chin + ' C' + d + ' ' + (chin - 4) + ' ' + b + ' 146 ' + b + ' 116 C' + b + ' 86 ' + d + ' 64 120 64 Z';
}
const TEX = 'M100 22 C108 14 128 12 138 20 M96 34 C102 26 112 24 118 26 M126 26 C134 24 142 30 144 38';

function hairBack(c: Look): string {
  const h = c.hairColor, t = shade(h, 0.12);
  switch (c.hair) {
    case 'bun': return '<ellipse cx="120" cy="100" rx="58" ry="54" fill="' + h + '"/><circle cx="120" cy="38" r="28" fill="' + h + '"/><path d="' + TEX + '" stroke="' + t + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    case 'afro': return '<circle cx="120" cy="94" r="74" fill="' + h + '"/>' + texture(h, 120, 94, 66);
    case 'twa': return '<ellipse cx="120" cy="90" rx="60" ry="52" fill="' + h + '"/>' + texture(h, 120, 84, 50);
    case 'puffs': return '<circle cx="64" cy="58" r="30" fill="' + h + '"/><circle cx="176" cy="58" r="30" fill="' + h + '"/><ellipse cx="120" cy="98" rx="54" ry="50" fill="' + h + '"/>' + texture(h, 64, 58, 24) + texture(h, 176, 58, 24);
    case 'braids': {
      let s = '<path d="M64 110 C60 60 90 44 120 44 C150 44 180 60 176 110 L184 236 L156 240 L158 150 L82 150 L84 240 L56 236 Z" fill="' + h + '"/>';
      for (let i = 0; i < 6; i++) { s += '<path d="M' + (62 + i * 4) + ' 120 L' + (60 + i * 4) + ' 232" stroke="' + t + '" stroke-width="1.6"/><path d="M' + (158 + i * 4) + ' 120 L' + (160 + i * 4) + ' 232" stroke="' + t + '" stroke-width="1.6"/>'; }
      const beads = c.accent || '#c98a2e';
      [62, 70, 78, 162, 170, 178].forEach(function (x, k) { s += '<circle cx="' + x + '" cy="' + (234 + (k % 2) * 4) + '" r="3.6" fill="' + (k % 2 ? '#f2ece0' : beads) + '"/>'; });
      return s;
    }
    case 'locs': {
      let l = '<ellipse cx="120" cy="96" rx="60" ry="54" fill="' + h + '"/>';
      [68, 78, 88, 152, 162, 172].forEach(function (x, k) { l += '<rect x="' + (x - 5) + '" y="96" width="10" height="' + (96 + (k % 3) * 14) + '" rx="5" fill="' + (k % 2 ? h : t) + '"/>'; });
      return l;
    }
    default: return '';
  }
}
function texture(h: string, cx: number, cy: number, r: number): string {
  const t = shade(h, 0.14)
  let s = ''
  for (let i = 0; i < 18; i++) {
    const a = i * 2.39996, d = r * Math.sqrt((i + 0.5) / 18);
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    s += '<path d="M' + (x - 4).toFixed(1) + ' ' + y.toFixed(1) + ' q4 -4 8 0" stroke="' + t + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  }
  return s;
}
function hairFront(c: Look): string {
  const h = c.hairColor;
  switch (c.hair) {
    case 'bun': case 'afro': case 'twa': case 'puffs': case 'braids': case 'locs':
      return '<path d="M72 112 C70 78 94 56 122 56 C150 56 171 78 168 112 C162 92 150 80 132 77 C118 75 100 77 90 85 C82 92 76 100 72 112 Z" fill="' + h + '"/>';
    case 'lowcut': return '<path d="M78 110 C76 78 96 58 120 58 C146 58 166 78 162 110 C158 92 146 82 120 82 C96 82 82 92 78 110 Z" fill="' + h + '"/>';
    case 'part': return '<path d="M78 110 C76 78 96 58 120 58 C146 58 166 78 162 110 C158 92 146 82 120 82 C96 82 82 92 78 110 Z" fill="' + h + '"/><path d="M100 64 C98 72 98 78 100 84" stroke="' + shade(h, 0.3) + '" stroke-width="1.8" fill="none"/>';
    case 'fade': return '<path d="M80 108 C78 84 92 66 108 60 C104 52 112 46 120 46 C134 46 146 52 150 60 C158 68 164 84 160 108 C156 92 146 84 120 84 C96 84 84 92 80 108 Z" fill="' + h + '"/><path d="M80 108 C79 98 80 92 82 88 M160 108 C161 98 160 92 158 88" stroke="' + shade(h, 0.25) + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    case 'sides': return '<path d="M74 118 C72 104 76 96 82 92 M166 118 C168 104 164 96 158 92" stroke="' + h + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    default: return '';
  }
}
function headwear(c: Look, part: 'back' | 'front'): string {
  const col = c.hwColor || '#0f6b63', dk = shade(col, -0.25), lt = shade(col, 0.3);
  if (c.hw === 'hijab') {
    if (part === 'back') return '<path d="M62 118 C58 66 90 42 120 42 C150 42 182 66 178 118 C180 162 172 198 152 216 C140 226 100 226 88 216 C68 198 60 162 62 118 Z" fill="' + col + '"/><path d="M150 60 C170 76 180 100 178 130" stroke="' + dk + '" stroke-width="3" fill="none" opacity=".5"/>';
    return '<path d="M74 110 C76 78 98 62 120 62 C142 62 164 78 166 110 C158 88 142 80 120 80 C98 80 82 88 74 110 Z" fill="' + dk + '"/><path d="M84 176 C98 192 142 192 156 176 C150 196 132 206 120 206 C108 206 90 196 84 176 Z" fill="' + col + '"/>';
  }
  if (part === 'back') return '';
  switch (c.hw) {
    case 'gele':
      return '<path d="M64 104 C56 64 84 30 124 28 C166 26 190 58 178 104 C166 88 146 80 120 80 C94 80 74 88 64 104 Z" fill="' + col + '"/>' +
        '<path d="M82 40 C110 18 160 18 184 44 C176 54 166 60 150 60 C168 46 140 30 112 36 C100 38 90 42 82 40 Z" fill="' + lt + '"/>' +
        '<path d="M150 60 C176 58 196 44 206 26 C204 50 188 70 166 76 Z" fill="' + dk + '"/>' +
        '<path d="M74 80 C92 64 120 58 150 64 M70 94 C92 78 130 72 168 84 M96 46 C118 40 146 42 166 52" stroke="' + dk + '" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>';
    case 'fila':
      return '<path d="M72 96 C66 58 98 34 132 36 C162 38 180 58 172 84 C150 72 108 74 72 96 Z" fill="' + col + '"/>' +
        '<path d="M72 96 C108 74 150 72 172 84 L174 92 C150 82 110 84 76 104 Z" fill="' + dk + '"/>' +
        '<path d="M96 52 C110 44 130 42 146 46 M88 66 C108 56 134 54 158 58" stroke="' + lt + '" stroke-width="2" fill="none" opacity=".6"/>';
    case 'kufi': {
      let k = '<path d="M78 86 C78 52 100 40 120 40 C140 40 162 52 162 86 C140 77 100 77 78 86 Z" fill="' + col + '"/>';
      for (let i = 0; i < 9; i++) k += '<circle cx="' + (86 + i * 8.5) + '" cy="' + (80 - Math.sin(i / 8 * Math.PI) * 3) + '" r="1.8" fill="' + (c.accent || '#c98a2e') + '"/>';
      return k + '<path d="M92 60 C104 52 136 52 148 60" stroke="' + (c.accent || '#c98a2e') + '" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>';
    }
    case 'phones':
      return '<path d="M68 116 C66 52 174 52 172 116" stroke="#2d3036" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<rect x="58" y="102" width="20" height="34" rx="9" fill="#2d3036"/><rect x="162" y="102" width="20" height="34" rx="9" fill="#2d3036"/>' +
        '<rect x="62" y="108" width="6" height="22" rx="3" fill="' + col + '"/><rect x="172" y="108" width="6" height="22" rx="3" fill="' + col + '"/>';
    default: return '';
  }
}
function outfit(c: Look, part: 'base' | 'front'): string {
  const col = c.outfitColor || '#1f3a68', dk = shade(col, -0.22), lt = shade(col, 0.18), ac = c.accent || '#c98a2e';
  const torso = 'M18 280 C22 228 58 206 120 202 C182 206 218 228 222 280 Z';
  const shadow = '<path d="M188 222 C206 234 218 254 222 280 L196 280 C194 256 192 238 188 222 Z" fill="' + dk + '" opacity=".55"/>';
  if (part === 'base') {
    switch (c.outfit) {
      case 'agbada': return '<path d="M-6 280 C2 222 48 202 120 198 C192 202 238 222 246 280 Z" fill="' + col + '"/><path d="M200 220 C226 236 240 256 246 280 L210 280 C206 254 204 236 200 220 Z" fill="' + dk + '" opacity=".5"/>';
      case 'labcoat': return '<path d="' + torso + '" fill="#f7f6f2"/><path d="M188 222 C206 234 218 254 222 280 L196 280 C194 256 192 238 188 222 Z" fill="#dcd8cf" opacity=".8"/>';
      case 'uniform': return '<path d="' + torso + '" fill="#fbfaf7"/><path d="M188 222 C206 234 218 254 222 280 L196 280 C194 256 192 238 188 222 Z" fill="#dcd6ca" opacity=".8"/>';
      default: return '<path d="' + torso + '" fill="' + col + '"/>' + shadow;
    }
  }
  switch (c.outfit) {
    case 'blazer':
      return '<path d="M92 206 L120 254 L148 206 C138 202 128 201 120 201 C112 201 102 202 92 206 Z" fill="#f2ece0"/><path d="M120 254 L148 206 L140 204 L120 240 Z" fill="#ddd1bd"/>' +
        '<path d="M92 206 C82 218 80 240 96 266 L111 240 L100 216 Z" fill="' + lt + '"/><path d="M148 206 C158 218 160 240 144 266 L129 240 L140 216 Z" fill="' + dk + '"/>';
    case 'uniform':
      return '<path d="M100 202 L120 224 L108 236 L90 210 Z" fill="#ffffff"/><path d="M140 202 L120 224 L132 236 L150 210 Z" fill="#ebe6db"/>' +
        '<path d="M114 224 L126 224 L131 272 L120 280 L109 272 Z" fill="' + col + '"/><path d="M120 224 L126 224 L131 272 L120 280 Z" fill="' + dk + '"/><path d="M113 214 L127 214 L125 227 L115 227 Z" fill="' + lt + '"/>' +
        '<path d="M112 244 L128 238 M110 260 L130 252" stroke="' + lt + '" stroke-width="2" opacity=".7"/>';
    case 'kaftan':
      return '<path d="M98 204 C104 228 136 228 142 204" stroke="' + ac + '" stroke-width="4" fill="none"/><path d="M120 226 L120 270" stroke="' + ac + '" stroke-width="3" stroke-dasharray="4 4"/>' +
        '<path d="M94 214 C104 240 136 240 146 214" stroke="' + ac + '" stroke-width="1.6" fill="none" stroke-dasharray="2 4"/>';
    case 'agbada':
      return '<path d="M86 208 C94 256 146 256 154 208 C140 238 100 238 86 208 Z" fill="' + ac + '"/><path d="M98 214 C106 244 134 244 142 214" stroke="' + shade(ac, -0.3) + '" stroke-width="2" fill="none"/><circle cx="120" cy="248" r="4" fill="' + shade(ac, -0.3) + '"/>';
    case 'labcoat':
      return '<path d="M98 204 L120 236 L142 204 C134 201 126 200 120 200 C114 200 106 201 98 204 Z" fill="' + col + '"/>' +
        '<path d="M98 204 C88 216 88 238 100 262 L114 236 Z" fill="#ffffff" stroke="#d7d2c8" stroke-width="1.4"/><path d="M142 204 C152 216 152 238 140 262 L126 236 Z" fill="#ece8df" stroke="#d7d2c8" stroke-width="1.4"/>' +
        '<rect x="150" y="238" width="26" height="22" rx="3" fill="none" stroke="#d7d2c8" stroke-width="1.4"/><rect x="155" y="228" width="3" height="14" rx="1.5" fill="#1f3a68"/><rect x="161" y="230" width="3" height="12" rx="1.5" fill="#c0392b"/>';
    case 'hoodie':
      return '<path d="M70 216 C78 196 100 190 120 190 C140 190 162 196 170 216 C156 208 140 206 120 206 C100 206 84 208 70 216 Z" fill="' + dk + '"/>' +
        '<path d="M108 210 L104 248 M132 210 L136 248" stroke="#f2ece0" stroke-width="2.4" stroke-linecap="round"/><circle cx="104" cy="250" r="2.6" fill="#f2ece0"/><circle cx="136" cy="250" r="2.6" fill="#f2ece0"/>' +
        '<path d="M86 262 h68" stroke="' + dk + '" stroke-width="2" opacity=".6"/>';
    case 'track':
      return '<path d="M104 200 L104 214 C112 218 128 218 136 214 L136 200" fill="' + dk + '"/><path d="M120 216 L120 280" stroke="' + dk + '" stroke-width="2"/>' +
        '<path d="M30 254 C50 228 78 214 100 208 M210 254 C190 228 162 214 140 208" stroke="#ffffff" stroke-width="4" fill="none" opacity=".9"/>' +
        '<path d="M108 214 L116 246 M132 214 L124 246" stroke="#f2ece0" stroke-width="1.6"/><rect x="113" y="244" width="14" height="9" rx="3" fill="#c9cdd4"/><circle cx="125" cy="248.5" r="3" fill="#9aa0a8"/>';
    case 'jersey':
      return '<path d="M100 202 L120 226 L140 202" stroke="#ffffff" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
        '<path d="M24 262 C34 236 48 222 62 214" stroke="#ffffff" stroke-width="6" fill="none" opacity=".9"/><path d="M216 262 C206 236 192 222 178 214" stroke="#ffffff" stroke-width="6" fill="none" opacity=".9"/>' +
        '<text x="148" y="258" font-family="Sora, sans-serif" font-size="22" font-weight="700" fill="#ffffff">10</text>';
    case 'tee':
      return '<path d="M100 204 C106 214 134 214 140 204" stroke="' + dk + '" stroke-width="3" fill="none"/>' +
        '<circle cx="80" cy="246" r="6" fill="#c98a2e"/><circle cx="92" cy="238" r="3" fill="#c98a2e"/><circle cx="156" cy="256" r="7" fill="#3b6fd4"/><circle cx="168" cy="246" r="3.5" fill="#c4485f"/><circle cx="140" cy="236" r="2.6" fill="#2f9e5f"/>';
    case 'buba': {
      let p = '<path d="M98 204 C106 222 134 222 142 204" stroke="' + dk + '" stroke-width="3" fill="none"/>';
      [[60, 244], [92, 262], [150, 240], [182, 258], [118, 250], [40, 270], [200, 274]].forEach(function (q) {
        p += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="8" fill="none" stroke="' + ac + '" stroke-width="3"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.5" fill="' + ac + '"/>';
      });
      return p;
    }
    default: return '';
  }
}
function eyes(c: Look): string {
  const lid = '#1b1411';
  if (c.eyes === 'happy') return '<path d="M92 116 Q102 106 112 116 M128 116 Q138 106 148 116" stroke="' + lid + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  const r = c.eyes === 'wide' ? 4.8 : 4.3;
  return '<g class="blink"><path d="M92 114 C97 108 107 108 112 114 C107 118 97 118 92 114 Z" fill="#fbf6ef"/><path d="M128 114 C133 108 143 108 148 114 C143 118 133 118 128 114 Z" fill="#f1e9de"/>' +
    '<circle cx="102" cy="113.4" r="' + r + '" fill="#2a1810"/><circle cx="138" cy="113.4" r="' + r + '" fill="#2a1810"/><circle cx="103.4" cy="112" r="1.3" fill="#fff"/><circle cx="139.4" cy="112" r="1.3" fill="#fff"/></g>' +
    '<path d="M91 114 C96 106 108 106 113 113 M127 113 C132 106 144 106 149 114" stroke="' + lid + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
}
function brows(c: Look): string {
  const col = c.browColor || '#1b1411'; let d: string;
  switch (c.brows) {
    case 'raised': d = 'M89 94 C95 88 105 88 112 92 M128 92 C135 88 145 88 151 94'; break;
    case 'stern': d = 'M89 96 C96 96 105 98 112 102 M128 102 C135 98 144 96 151 96'; break;
    case 'soft': d = 'M90 100 C96 97 105 97 111 99 M129 99 C135 97 144 97 150 100'; break;
    case 'arch': d = 'M88 100 C94 92 106 92 112 98 M128 98 C134 92 146 92 152 100'; break;
    default: d = 'M89 99 C95 94 105 94 112 97 M128 97 C135 94 145 94 151 99';
  }
  return '<path d="' + d + '" stroke="' + col + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
}
function glasses(c: Look): string {
  const f = c.frame || '#2a2420';
  if (c.glasses === 'round') return '<circle cx="101" cy="114" r="13" fill="#ffffff" fill-opacity=".1" stroke="' + f + '" stroke-width="2.2"/><circle cx="139" cy="114" r="13" fill="#ffffff" fill-opacity=".1" stroke="' + f + '" stroke-width="2.2"/><path d="M114 112 C117 109 123 109 126 112 M88 112 L74 108 M152 112 L166 108" stroke="' + f + '" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M93 122 L101 104" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>';
  if (c.glasses === 'rect') return '<rect x="85" y="103" width="32" height="22" rx="8.5" fill="#ffffff" fill-opacity=".1" stroke="' + f + '" stroke-width="2.2"/><rect x="123" y="103" width="32" height="22" rx="8.5" fill="#ffffff" fill-opacity=".1" stroke="' + f + '" stroke-width="2.2"/><path d="M117 111 C119 108.5 121 108.5 123 111 M85 109 L74 107 M155 109 L166 107" stroke="' + f + '" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M90 121 L98 106 M128 121 L136 106" stroke="#fff" stroke-width="1.6" opacity=".3" stroke-linecap="round"/>';
  return '';
}
function mouth(c: Look): string {
  switch (c.mouth) {
    case 'smile': return '<g class="cm"><path d="M104 150 C110 163 130 163 136 150 C128 153 112 153 104 150 Z" fill="#3a1a12"/><path d="M107 151.5 C113 155 127 155 133 151.5" stroke="#f6f1e8" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>';
    case 'grin': return '<g class="cm"><path d="M100 148 C108 168 132 168 140 148 C130 152 110 152 100 148 Z" fill="#3a1a12"/><path d="M103 149.5 C112 154 128 154 137 149.5" stroke="#f6f1e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M110 160 C116 164 124 164 130 160 C124 158 116 158 110 160 Z" fill="#b24b45"/></g>';
    case 'smirk': return '<g class="cm"><path d="M106 153 C116 158 128 156 136 148 C128 152 116 154 106 153 Z" fill="#5a2820"/></g><path d="M136 148 C138 147 139 146 139 144" stroke="#4e2c19" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    case 'o': return '<g class="cm"><ellipse cx="120" cy="154" rx="6" ry="5" fill="#3a1a12"/></g>';
    default: return '<g class="cm"><path d="M105 152 C111 147.5 116.5 148.5 120 150 C123.5 148.5 129 147.5 135 152 C128 154.5 112 154.5 105 152 Z" fill="#5a2820"/><path d="M106 152.4 C111 161 129 161 134 152.4 C127 155.2 113 155.2 106 152.4 Z" fill="#7d3a2e"/></g>';
  }
}
function facialHair(c: Look): string {
  const col = c.beardColor || '#1b1411';
  let s = '';
  if (c.beard === 'full') s += '<path d="M78 128 C80 170 100 188 120 188 C140 188 160 170 162 128 C156 154 142 166 120 166 C98 166 84 154 78 128 Z" fill="' + col + '"/>';
  if (c.beard === 'short') s += '<path d="M84 140 C88 168 104 180 120 180 C136 180 152 168 156 140 C150 160 138 170 120 170 C102 170 90 160 84 140 Z" fill="' + col + '" opacity=".9"/>';
  if (c.beard === 'goatee') s += '<path d="M108 164 C110 176 130 176 132 164 C126 168 114 168 108 164 Z" fill="' + col + '"/>';
  if (c.beard === 'full' || c.beard === 'short' || c.beard === 'mustache' || c.beard === 'goatee') s += '<path d="M104 146 C110 141 118 142 120 144 C122 142 130 141 136 146 C130 145 124 146 120 147 C116 146 110 145 104 146 Z" fill="' + col + '"/>';
  return s;
}
/** The drawing without its outer <svg>, for placing inside a larger scene. */
export function drawCharacterParts(c: Look): string {
  const sk = SKIN[c.skin], id = 'ct-skin-' + c.skin;
  const w = c.faceW || 46, chin = c.chin || 174;
  const noEars = c.hw === 'hijab';
  let s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="' + sk[0] + '"/><stop offset="1" stop-color="' + sk[1] + '"/></linearGradient></defs>';
  s += hairBack(c);
  s += outfit(c, 'base');
  s += '<path d="M103 156 L103 202 C110 214 130 214 137 202 L137 156 Z" fill="url(#' + id + ')"/><path d="M103 164 C112 182 128 182 137 164 L137 156 L103 156 Z" fill="#3c200f" opacity=".45"/>';
  s += outfit(c, 'front');
  if (c.necklace) s += '<path d="M107 206 C113 216 127 216 133 206" stroke="#d9b062" stroke-width="1.4" fill="none"/><circle cx="120" cy="216.5" r="2.6" fill="#e2bc6e"/>';
  s += headwear(c, 'back');
  if (!noEars) {
    s += '<ellipse cx="' + (120 - w - 1) + '" cy="118" rx="7" ry="11" fill="' + sk[1] + '"/><ellipse cx="' + (120 + w + 1) + '" cy="118" rx="7" ry="11" fill="' + shade(sk[1], -0.08) + '"/>';
    if (c.earrings === 'hoop') s += '<circle cx="' + (120 - w - 2) + '" cy="136" r="5.5" fill="none" stroke="#d9a24c" stroke-width="2"/><circle cx="' + (120 + w + 2) + '" cy="136" r="5.5" fill="none" stroke="#d9a24c" stroke-width="2"/>';
    if (c.earrings === 'stud') s += '<circle cx="' + (120 - w - 2) + '" cy="132" r="3" fill="#d9a24c"/><circle cx="' + (120 + w + 2) + '" cy="132" r="3" fill="#d9a24c"/>';
  }
  s += '<path d="' + face(w, chin) + '" fill="url(#' + id + ')"/>';
  s += '<path d="M140 68 C' + (114 + w) + ' 76 ' + (120 + w) + ' 96 ' + (120 + w) + ' 116 C' + (120 + w) + ' 146 150 ' + (chin - 4) + ' 120 ' + chin + ' C140 ' + (chin - 10) + ' 153 144 153 118 C153 96 148 80 140 68 Z" fill="#3c200f" opacity=".22"/>';
  s += '<path d="M92 76 C84 86 80 98 80 110" stroke="' + shade(sk[0], 0.25) + '" stroke-width="5" stroke-linecap="round" fill="none" opacity=".35"/>';
  s += '<ellipse cx="94" cy="136" rx="9" ry="5" fill="#b0603f" opacity=".26"/><ellipse cx="146" cy="136" rx="9" ry="5" fill="#9a4f33" opacity=".22"/>';
  if (c.old) s += '<path d="M86 120 l-6 3 M154 120 l6 3 M108 136 C104 144 104 150 106 156 M132 136 C136 144 136 150 134 156" stroke="#3c200f" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>';
  s += hairFront(c);
  s += headwear(c, 'front');
  s += brows(c);
  s += eyes(c);
  s += glasses(c);
  s += '<path d="M121 120 C123 130 127 136 126 140 C124 142 118 142 115 140 C113 139 113 137 115 136 C118 132 120 126 121 120 Z" fill="#3c200f" opacity=".35"/><path d="M113 139 C115 141 117 141 118 140 M122 140 C123 141 125 141 127 139" stroke="#3c200f" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".7"/>';
  s += facialHair(c);
  s += mouth(c);
  return s;
}

export function drawCharacter(c: Look, cls = ''): string {
  return '<svg class="' + cls + '" viewBox="0 0 240 280" aria-hidden="true">' + drawCharacterParts(c) + '</svg>';
}
