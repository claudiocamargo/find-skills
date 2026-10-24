// Generates the "many into one" diagrams (wide and tall) and the receipt zigzag.
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
function diagram(W, H, vertical) {
  const out = []; const r = 6.5; const N = 141; let i = 0;
  const put = (x, y, cls) => {
    const dx = ((rnd() - 0.5) * 160).toFixed(0), dy = ((rnd() - 0.5) * 120).toFixed(0);
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" class="${cls}" style="--dx:${dx}px;--dy:${dy}px;--i:${i++}"/>`);
  };
  const third = (vertical ? H : W) / 3;
  // zone 1: scatter, two pale tones
  for (let k = 0; k < 45; k++) {
    const a = rnd() * (third - 40) + 20, b = rnd() * ((vertical ? W : H) - 40) + 20;
    vertical ? put(b, a, k % 2 ? 'p1' : 'p2') : put(a, b, k % 2 ? 'p1' : 'p2');
  }
  // zone 2: tight ribbon three high
  const len = 16, gap = (third - 40) / (len - 1);
  for (let row = 0; row < 3; row++) for (let k = 0; k < len; k++) {
    const a = third + 20 + k * gap, b = (vertical ? W : H) / 2 + (row - 1) * 15;
    vertical ? put(b, a, 'm') : put(a, b, 'm');
  }
  // zone 3: fans out into ordered rows, accent
  const cols = 8, rows = 6; const cw = (third - 40) / (cols - 1), rh = ((vertical ? W : H) - 60) / (rows - 1);
  for (let row = 0; row < rows; row++) for (let k = 0; k < cols; k++) {
    const a = 2 * third + 20 + k * cw, b = 30 + row * rh;
    vertical ? put(b, a, 'a') : put(a, b, 'a');
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="diagram__svg${vertical ? ' diagram__svg--tall' : ' diagram__svg--wide'}" role="img" aria-label="Círculos soltos que se organizam numa faixa e depois em fileiras ordenadas: do começo sem experiência à liderança.">${out.join('')}</svg>`;
}
const teeth = 28; const pts = ['0 0', '100% 0', '100% calc(100% - 12px)'];
for (let k = teeth * 2 - 1; k >= 0; k--) pts.push(`${(k * 100 / (teeth * 2)).toFixed(3)}% ${k % 2 ? '100%' : 'calc(100% - 12px)'}`);
console.log(JSON.stringify({ wide: diagram(1200, 266, false), tall: diagram(300, 400, true), zig: `polygon(${pts.join(', ')})` }));
