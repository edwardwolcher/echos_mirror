class SpeechRec extends webkitSpeechRecognition {
  constructor(stopWords = "mirror mirror", lang = "en-US") {
    super();
    this.stopWords = stopWords;
    this.results = [];
    this.lang = lang;
    this.continuous = true;
    this.interimResults = true;
    this.onend = () => {
      this.start();
    };
    this.onresult = (e) => {
      this.results = e.results;
      this._checkStop();
    };
    this.start();
  }
  _checkStop() {
    if (
      this.results[this.results.length - 1].isFinal &&
      this.results[this.results.length - 1][0].transcript
        .toLowerCase()
        .includes(this.stopWords)
    ) {
      this.results = [];
    }
  }
  textList() {
    const transcripts = [];
    for (let i = 0; i < this.results.length; i++) {
      transcripts.push(this.results[i][0].transcript);
    }
    return transcripts;
  }

  get text() {
    let text = "";
    for (let i = 0; i < this.results.length; i++) {
      text += " " + this.results[i][0].transcript;
    }
    return text;
  }
}
