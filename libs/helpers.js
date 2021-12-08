function createWeightTable(tableFont) {
  const ASCII_MIN = 32;
  const ASCII_MAX = 126;

  const weightTable = [];
  const fontSize = 10;
  tmp_cnv = createGraphics(fontSize * 5, fontSize * 3);
  tmp_cnv.textFont(tableFont, fontSize);
  tmp_cnv.textAlign(CENTER, CENTER);
  tmp_cnv.textStyle(NORMAL);
  tmp_cnv.noStroke();
  tmp_cnv.fill(255);

  for (let i = ASCII_MIN; i < ASCII_MAX; i++) {
    tmp_cnv.background(0);
    const glyph = char(i);
    tmp_cnv.text(glyph, tmp_cnv.width * 0.5, tmp_cnv.height * 0.5);
    tmp_cnv.loadPixels();
    let weight = 0;
    for (let j = 0; j < tmp_cnv.pixels.length; j += 4) {
      weight += tmp_cnv.pixels[j];
    }
    weightTable.push({ glyph: glyph, weight: weight });
  }
  const sortedWeightTable = weightTable.sort((a, b) =>
    a.weight < b.weight ? 1 : -1
  );
  const maxWeight = sortedWeightTable[0].weight;
  const step = maxWeight / 255;

  const finalWeightTable = [];

  let currentIdx = 0;
  let currentStep = maxWeight;

  for (let i = 0; i < 256; i++) {
    finalWeightTable.push(sortedWeightTable[currentIdx].glyph);
    currentStep -= step;
    if (currentStep <= sortedWeightTable[currentIdx].weight) {
      currentIdx++;
    }
  }
  tmp_cnv.remove();
  return finalWeightTable.reverse();
}

function createArray2d(w, h) {
  const array2d = [];
  for (y = 0; y < h; y++) {
    const row = [];
    for (x = 0; x < w; x++) {
      row.push(null);
    }
    array2d.push(row);
  }
  return array2d;
}
