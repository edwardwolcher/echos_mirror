class FaceBox {
  constructor(video, aspectRatio, asciiScale, minimumDeviation = 30) {
    this.video = video;
    this.aspectRatio = aspectRatio;
    this.asciiScale = asciiScale;
    this.boundingX = 0;
    this.boundingY = 0;
    this.boundingWidth = video.width;
    this.boundingHeight = video.height;
    this.minimumDeviation = minimumDeviation;
    this.faceMesh = ml5.facemesh(video, () => {
      console.log("faceMesh model loaded");
    });
    this.faceMesh.on("predict", (results) => {
      this._update(results);
    });
    this.predictions = null;
    this.featureMask = createImage(1, 1);
    this.faceMask = createImage(1, 1);
    this.asciiArray = createArray2d(
      this.aspectRatio.width * this.asciiScale,
      this.aspectRatio.height * this.asciiScale
    );
  }

  _update(results) {
    this.predictions = results;
    this._updateBoundingBox();
    this._updateFeatureMask();
    this._updateFaceMask();
    this._updateAsciiArray();
  }
  _updateBoundingBox() {
    if (!this.predictions || !this.predictions[0]) return;
    const prediction = this.predictions[0];
    const boxX = int(prediction.boundingBox.topLeft[0][0]);
    const boxY = int(prediction.boundingBox.topLeft[0][1]);
    const boxWidth = int(prediction.boundingBox.bottomRight[0][0] - boxX);
    const boxHeight = int(prediction.boundingBox.bottomRight[0][1] - boxY);
    if (
      abs(boxX - this.boundingX) > this.minimumDeviation ||
      abs(boxY - this.boundingY) > this.minimumDeviation
    ) {
      const ratio = this.aspectRatio.width / this.aspectRatio.height;
      const desiredWidth = int(this.boundingHeight * ratio);
      const desiredX = int(boxX - (desiredWidth - boxWidth) / 2);
      this.boundingX = desiredX > 0 ? desiredX : 0;
      this.boundingY = boxY;
      this.boundingWidth =
        desiredWidth < this.video.width ? desiredWidth : this.video.width;
      this.boundingHeight = boxHeight;
    }
  }

  face() {
    const videoImg = this.video.get();
    return videoImg.get(
      this.boundingX,
      this.boundingY,
      this.boundingWidth,
      this.boundingHeight
    );
  }

  _updateFeatureMask() {
    if (!this.predictions || !this.predictions[0]) return;

    const tmp_cnv = createGraphics(this.video.width, this.video.height);
    const a = this.predictions[0].annotations;

    tmp_cnv.fill(0);
    tmp_cnv.noStroke();

    tmp_cnv.beginShape();
    a.leftEyeLower2.forEach((pt) => {
      vertex(pt[0], pt[1]);
    });
    a.leftEyeUpper2
      .slice()
      .reverse()
      .forEach((pt) => {
        vertex(pt[0], pt[1]);
      });
    tmp_cnv.endShape(CLOSE);

    tmp_cnv.beginShape();
    a.rightEyeLower2.forEach((pt) => {
      vertex(pt[0], pt[1]);
    });
    a.rightEyeUpper2
      .slice()
      .reverse()
      .forEach((pt) => {
        vertex(pt[0], pt[1]);
      });
    tmp_cnv.endShape(CLOSE);

    tmp_cnv.strokeWeight(10);
    tmp_cnv.stroke(0);

    tmp_cnv.beginShape();
    a.lipsLowerOuter.forEach((pt) => {
      vertex(pt[0], pt[1]);
    });
    a.lipsUpperOuter
      .slice()
      .reverse()
      .forEach((pt) => {
        vertex(pt[0], pt[1]);
      });
    tmp_cnv.endShape(CLOSE);
    this.featureMask = tmp_cnv.get(
      this.boundingX,
      this.boundingY,
      this.boundingWidth,
      this.boundingHeight
    );

    tmp_cnv.remove();
  }
  _updateFaceMask() {
    if (!this.predictions || !this.predictions[0]) return;
    const tmp_cnv = createGraphics(this.video.width, this.video.height);
    const a = this.predictions[0].annotations;

    tmp_cnv.fill(0);
    tmp_cnv.stroke(0);
    tmp_cnv.strokeWeight(2);

    tmp_cnv.beginShape();
    a.silhouette.forEach((pt) => {
      vertex(pt[0], pt[1]);
    });
    tmp_cnv.endShape(CLOSE);

    this.faceMask = tmp_cnv.get(
      this.boundingX,
      this.boundingY,
      this.boundingWidth,
      this.boundingHeight
    );

    tmp_cnv.remove();
  }

  _updateAsciiArray() {
    const asciiWidth = this.aspectRatio.width * this.asciiScale;
    const asciiHeight = this.aspectRatio.height * this.asciiScale;
    const faceImg = this.face();

    faceImg.resize(asciiWidth, asciiHeight);
    faceImg.loadPixels();

    for (let y = 0; y < faceImg.height; y++) {
      for (let x = 0; x < faceImg.width; x++) {
        const pixelIdx = (y * faceImg.width + x) * 4;
        let weight = int(
          (faceImg.pixels[pixelIdx] +
            faceImg.pixels[pixelIdx + 1] +
            faceImg.pixels[pixelIdx + 2]) /
            3
        );
        this.asciiArray[y][x] = weight;
      }
    }
  }
}
