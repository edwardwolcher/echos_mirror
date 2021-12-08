const fnOptions = [
  simpleFace,
  simpleFace,
  blackOut,
  colorField,
  asciiField,
  asciiField,
  asciiField,
  asciiField,
  asciiField,
  asciiField,
  textField,
  textField,
  textSentimentField,
  textSentimentField,
  classifierFields,
  classifierFields,
  classifierFields,
  null,
  null,
];

class DrawFn {
  constructor(canvas, defaultFn = simpleFace, options = fnOptions) {
    this.canvas = canvas;
    this.bgFn = defaultFn;
    this.faceFn = null;
    this.featureFn = null;
    this.BGcolors = [10, 10, 10];
    this.FGcolors = [220, 220, 220];
    this.options = options;
  }
  draw() {
    push();
    if (this.bgFn) {
      const bgImg = this.bgFn(this, 0);
      this.canvas.image(bgImg, 0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.faceFn) {
      const faceImg = this.faceFn(this, 1);
      faceImg.mask(face.faceMask);
      this.canvas.image(faceImg, 0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.featureFn) {
      const featureImg = this.featureFn(this, 2);
      featureImg.mask(face.featureMask);
      this.canvas.image(
        featureImg,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    pop();
  }
  setColor(level, idx, newColor) {
    if (level == "bg") {
      this.BGcolors[idx] = newColor;
    }
    if (level == "fg") {
      this.FGcolors[idx] = newColor;
    }
  }
  setFn(level, newFn) {
    if (level == "bg") {
      this.bgFn = newFn;
    }
    if (level == "face") {
      this.faceFn = newFn;
    }
    if (level == "features") {
      this.featureFn = newFn;
    }
  }
  randomFns() {
    this.setFn("bg", random(this.options));
    this.setFn("face", random(this.options));
    this.setFn("features", random(this.options));
  }
  randomColors() {
    for (let i = 0; i < 3; i++) {
      const bgHue = random(360);
      const fgHue = (bgHue + random[(60, 120, 180)]) % 360;
      const sat = random(100);
      const bgColor = color(bgHue, sat, 50);
      const fgColor = color(fgHue, sat, 90);
      this.setColor("bg", i, bgColor);
      this.setColor("fg", i, fgColor);
    }
  }
  resetColors() {
    this.BGcolors = [10, 10, 10];
    this.FGcolors = [220, 220, 220];
  }
  pureAscii() {
    this.bgFn = asciiField;
    this.faceFn = asciiField;
    this.featureFn = asciiField;
  }
  pureText() {
    this.bgFn = random([textField, textSentimentField]);
    this.faceFn = random([textField, textSentimentField]);
    this.featureFn = random([textField, textSentimentField]);
  }
  dataFace() {
    this.bgFn = random([simpleFace, asciiField]);
    this.faceFn = random([simpleFace, asciiField]);
    this.featureFn = random([simpleFace, asciiField]);
  }
  pureClassify() {
    this.bgFn = classifierFields;
    this.faceFn = classifierFields;
    this.featureFn = classifierFields;
  }
}

function fullVideo() {
  if (!video.loadedmetadata) return createImage(1, 1);
  const tmp_cnv = createGraphics(width, height);
  const videoImg = video.get();
  videoImg.resize(0, height);
  if (videoImg.width > width) {
    const offset = (videoImg.width - width) / 2;
    const offsetImage = videoImg.get(offset, 0, width, videoImg.height);
    tmp_cnv.image(offsetImage, 0, 0, width, height);
  } else if (videoImg.width <= width) {
    const offset = (width - videoImg.width) / 2;
    tmp_cnv.image(videoImg, offset, 0, videoImg.width, height);
  }
  const simpleVideoImg = tmp_cnv.get();
  tmp_cnv.remove();
  return simpleVideoImg;
}

function simpleFace() {
  return face.face();
}

function blackOut() {
  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.fill(10);
  tmp_cnv.noStroke();
  tmp_cnv.rect(0, 0, tmp_cnv.width, tmp_cnv.height);
  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}

function colorField(parent, layer) {
  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.fill(parent.BGcolors[layer]);
  tmp_cnv.noStroke();
  tmp_cnv.rect(0, 0, tmp_cnv.width, tmp_cnv.height);
  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}

function asciiField(parent, layer) {
  const asciiArray = face.asciiArray;
  const asciiRows = asciiArray.length;
  const asciiCols = asciiArray[0].length;

  xOffset = width / asciiCols;
  yOffset = height / asciiRows;

  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.background(parent.BGcolors[layer]);
  tmp_cnv.textFont(settings.font, settings.fontSize);
  tmp_cnv.textAlign(CENTER, CENTER);
  tmp_cnv.textStyle(NORMAL);
  tmp_cnv.noStroke();
  tmp_cnv.fill(parent.FGcolors[layer]);

  for (let y = 0; y < asciiRows; y++) {
    for (let x = 0; x < asciiCols; x++) {
      let glyph = asciiArray[y][x] ? weightTable[asciiArray[y][x]] : " ";
      tmp_cnv.text(glyph, x * xOffset + xOffset / 2, y * yOffset + yOffset / 2);
    }
  }
  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}

function textField(parent, layer) {
  const rows = (settings.aspectRatio.width * settings.asciiScale) / 2;
  const cols = (settings.aspectRatio.height * settings.asciiScale) / 2;

  xOffset = width / cols;
  yOffset = height / rows;

  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.background(parent.BGcolors[layer]);
  tmp_cnv.textFont(settings.font, settings.fontSize * 2);
  tmp_cnv.textAlign(CENTER, CENTER);
  tmp_cnv.textStyle(NORMAL);
  tmp_cnv.noStroke();
  tmp_cnv.fill(parent.FGcolors[layer]);

  const currentText = textObj.useRaw ? textObj.rawText : textObj.libText;
  let strIdx = 0;

  for (let y = 0; y < rows; y++) {
    if (strIdx >= currentText.length) break;
    for (let x = 0; x < cols; x++) {
      if (strIdx >= currentText.length) break;
      let glyph = currentText[strIdx];
      tmp_cnv.text(glyph, x * xOffset + xOffset / 2, y * yOffset + yOffset / 2);
      strIdx++;
    }
  }
  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}

function textSentimentField(parent, layer) {
  const rows = (settings.aspectRatio.width * settings.asciiScale) / 2;
  const cols = (settings.aspectRatio.height * settings.asciiScale) / 2;

  xOffset = width / cols;
  yOffset = height / rows;

  const baseText = textObj.useRaw ? textObj.rawText : textObj.libText;
  const textArray = baseText.split(/[\.;]/);

  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.background(parent.BGcolors[layer]);
  tmp_cnv.textFont(settings.font, settings.fontSize * 2);
  tmp_cnv.textAlign(CENTER, CENTER);
  tmp_cnv.textStyle(NORMAL);
  tmp_cnv.noStroke();

  const charIdx = {
    x: 0,
    y: 0,
    done: false,
  };

  textArray.forEach((line) => {
    if (charIdx.done) return;
    const score = sentiment.predict(line);
    const hue = map(score.score, 0.0, 1.0, 0, 180);
    const brightness = map(score.score, 0.0, 1.0, 50, 100);
    tmp_cnv.fill(color(hue, 80, brightness));
    line.split("").forEach((glyph) => {
      if (charIdx.done) return;
      tmp_cnv.text(
        glyph,
        charIdx.x * xOffset + xOffset / 2,
        charIdx.y * yOffset + yOffset / 2
      );

      if (charIdx.x >= cols && charIdx.y >= rows) {
        charIdx.done = true;
      } else if (charIdx.x >= cols) {
        charIdx.x = 0;
        charIdx.y++;
      } else {
        charIdx.x++;
      }
    });
  });

  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}

function classifierFields(parent, layer) {
  const cols = (settings.aspectRatio.height * settings.asciiScale) / 8;
  yOffset = width / cols;

  const tmp_cnv = createGraphics(width, height);
  tmp_cnv.background(parent.BGcolors[layer]);
  tmp_cnv.textFont(settings.font, settings.fontSize * 4);
  tmp_cnv.textAlign(CENTER, CENTER);
  tmp_cnv.textStyle(NORMAL);
  tmp_cnv.noStroke();
  tmp_cnv.fill(parent.FGcolors[layer]);

  classifierResults.forEach((result, i) => {
    const label = result.label.toUpperCase();
    const conf = round(result.confidence * 100, 1);
    const str = `${label}, ${conf}%`;
    tmp_cnv.text(str, tmp_cnv.width / 2, i * yOffset + yOffset);
  });
  const img = tmp_cnv.get();
  tmp_cnv.remove();
  return img;
}
