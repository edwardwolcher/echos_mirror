// Global State Variables
let speech;
let speechResults = [];
let textObj = {
  rawText: "",
  libText: termsTexts[0],
  useRaw: false,
};
let face;
let classifier;
let classifierResults = [];
let sentiment;
let drawFunction;
let weightTable;
let running;
let runClock = 0;

// Global settings
const settings = {
  font: "Menlo-Bold, monospace",
  fontSize: 12,
  asciiScale: 4,
  aspectRatio: {
    width: 16,
    height: 22,
  },
  frameRate: 30,
  cycleTime: 3,
  videoOptions: {
    video: {
      facingMode: {
        exact: "user",
      },
    },
  },
};

function preload() {
  speech = new p5.SpeechRec();
  speech.continuous = true;
  speech.interimResults = false;
  speech.onResult = () => {
    console.log(speech.resultString);
    textObj.rawText += `${speech.resultString}. `;
    const maxLength =
      (settings.aspectRatio.width *
        settings.asciiScale *
        settings.aspectRatio.height *
        settings.asciiScale) /
      4;
    if (textObj.rawText.length >= maxLength) {
      textObj.rawText = textObj.rawText.substring(int(maxLength / 2));
    }
  };
  speech.onEnd = () => {
    speech.start();
  };
  sentiment = ml5.sentiment("movieReviews", () => {
    console.log("sentiment model loaded");
  });

  const video = createCapture(settings.videoOptions, () => {
    console.log("video loaded");
    face = new FaceBox(video, settings.aspectRatio, settings.asciiScale);
    classifier = new ml5.imageClassifier("MobileNet", video, () => {
      console.log("classifier model loaded");
      classifyVideo();
    });
  });
  video.hide();
  weightTable = createWeightTable(settings.font);
  drawFunction = simpleFace;
}

function classifyVideo() {
  classifier.classify((err, results) => {
    if (err) {
      console.error(err);
    }
    classifierResults = results;
    classifyVideo();
  });
}

function setup() {
  createCanvas(
    int(
      (windowHeight * settings.aspectRatio.width) / settings.aspectRatio.height
    ),
    windowHeight
  );
  colorMode(HSB);
  frameRate(settings.frameRate);
  background(0);
  speech.start();
  drawFunction = new DrawFn(this);
  running = true;
}

function windowResized() {
  resizeCanvas(
    int(
      (windowHeight * settings.aspectRatio.width) / settings.aspectRatio.height
    ),
    windowHeight
  );
}

function draw() {
  if (!face || !drawFunction || !sentiment || !classifier) return;

  if (!running) return;
  drawFunction.draw();

  runClock++;
  if (runClock > settings.frameRate * settings.cycleTime) {
    runClock = 0;
    updateState();
  }
}

function updateState() {
  const textChangeOptions = ["terms", "corpus"];
  if (textObj.rawText.length > 40) {
    textChangeOptions.append("raw");
  }
  if (textObj.rawText.length > 100) {
    textChangeOptions.append("raw");
  }

  const colorChange = random(["colors", "reset"]);
  const textChange = random(textChangeOptions);
  const fnChange = random([
    "random",
    "random",
    "ascii",
    "text",
    "classify",
    "face",
  ]);

  switch (colorChange) {
    case "colors":
      drawFunction.randomColors();
      break;
    case "reset":
      drawFunction.resetColors();
  }
  switch (textChange) {
    case "terms":
      textObj.useRaw = false;
      textObj.libText = random(termsTexts);
      break;
    case "corpus":
      textObj.useRaw = false;
      textObj.libText = random(corpusTexts);
      break;
    case "raw":
      textObj.useRaw = true;
      break;
  }
  switch (fnChange) {
    case "random":
      drawFunction.randomFns();
      break;
    case "ascii":
      drawFunction.pureAscii();
      break;
    case "text":
      drawFunction.pureText();
      break;
    case "face":
      drawFunction.dataFace();
      break;
    case "classify":
      drawFunction.pureClassify();
  }
}

function mousePressed() {
  running = !running;
  runClock = 0;
  if (running) {
    updateState();
  }
}
