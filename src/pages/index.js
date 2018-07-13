import React from 'react';
import Link from 'gatsby-link';
import delve from 'dlv';
import shortId from 'shortid';

const IndexPage = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWord: '',
      teleprompterText: 'The quick brown fox jumps over the lazy dog.',
      parsedTeleprompterText: [],
      showTeleprompter: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      this.speechRecognition = new webkitSpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      // this.speechRecognition.maxAlternatives = 5;
      // this.speechRecognition.onstart = function() {
      //   console.log('on start called')
      // };

      this.speechRecognition.onresult = event => {
        // console.log(event)
        const resultIndex = event.resultIndex;
        let currentPhrase = delve(event, `results.${resultIndex}.0.transcript`);
        if (currentPhrase) {
          currentPhrase = this.splitStringToArray(currentPhrase).map(word =>
            word.toLowerCase()
          );
        }

        const copyOfParsedTeleprompterText = [
          ...this.state.parsedTeleprompterText,
        ];
        currentPhrase.forEach(phraseWord => {
          const lastSuccessfulWord = [...this.state.parsedTeleprompterText]
            .reverse()
            .find(word => word.success);

          let lastSuccessfulWordIndex = 0;
          if (lastSuccessfulWord) {
            lastSuccessfulWordIndex =
              copyOfParsedTeleprompterText.findIndex(
                word => word.key === lastSuccessfulWord.key
              ) + 1;
          }

          for (
            let i = lastSuccessfulWordIndex;
            i < lastSuccessfulWordIndex + 3 &&
            i < copyOfParsedTeleprompterText.length;
            i++
          ) {
            const word = copyOfParsedTeleprompterText[i];
            console.log(i, word);

            console.log('PHRASE WORD', phraseWord, 'WORD IM LOOKING FOR', word);
            const isWordInPhrase = currentPhrase.find(
              phraseWord =>
                phraseWord ===
                word.word
                  .toLowerCase()
                  .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            );
            // console.log(isWordInPhrase)

            if (isWordInPhrase) {
              copyOfParsedTeleprompterText[i]['success'] = true;
            }
          }
        });

        this.setState({
          parsedTeleprompterText: copyOfParsedTeleprompterText,
        });
      };
    }
  }

  splitStringToArray(string) {
    return string.split(/(\s+)/).filter(e => e.trim().length > 0);
  }

  handleSubmit(event) {
    this.speechRecognition.start();
    this.setState({
      showTeleprompter: true,
      parsedTeleprompterText: this.splitStringToArray(
        this.state.teleprompterText
      )
        // .toLowerCase()
        // .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        .map(word => ({
          word,
          key: shortId.generate(),
          missing: false,
          success: false,
        })),
    });

    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ teleprompterText: event.target.value });
  }

  render() {
    console.log(this.state);

    return (
      <div>
        <h1>Hi people</h1>
        <form onSubmit={this.handleSubmit}>
          <textarea
            rows="4"
            cols="50"
            value={this.state.teleprompterText}
            onChange={this.handleChange}
          />
          <input type="submit" value="Start Telepromptly" />
        </form>
        {this.state.showTeleprompter ? (
          <div>
            <h2>TELEPROMPTER STARTING</h2>
            <div>
              {this.state.parsedTeleprompterText.map(word => (
                <span
                  className={`word ${word.success ? 'green' : ''} ${
                    word.missing ? 'orange' : ''
                  }`}
                  key={word.key}
                >
                  {word.word}{' '}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
};

export default IndexPage;
