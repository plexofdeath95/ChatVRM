# ChatVRM

ChatVRM is a demo application that allows you to easily converse with 3D characters in your browser.

You can import VRM files, adjust voice settings to match the character, and generate responses with emotional expressions.

The main technologies used in ChatVRM are as follows:

- **User voice recognition**  
    - [Web Speech API (SpeechRecognition)](https://developer.mozilla.org/en/docs/Web/API/SpeechRecognition)
- **Response text generation**  
    - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat)
- **Text-to-speech generation**  
    - [Koemotion/Koeiromap API](https://koemotion.rinna.co.jp/)
- **3D character display**  
    - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

## Demo
A demo is available on Glitch:

[https://chatvrm.glitch.me](https://chatvrm.glitch.me)

## Running Locally
To run ChatVRM in your local environment, clone or download this repository:

```bash
git clone git@github.com:pixiv/ChatVRM.git
```

Install the required packages:

```bash
npm install
```

Once the installation is complete, start the development web server with the following command:

```bash
npm run dev
```

After running, access the following URL to verify it works:

[http://localhost:3000](http://localhost:3000)

---

## ChatGPT API
ChatVRM uses the ChatGPT API to generate response texts.

For the specifications and terms of use of the ChatGPT API, please refer to the following links and the official website:

- [https://platform.openai.com/docs/api-reference/chat](https://platform.openai.com/docs/api-reference/chat)
- [https://openai.com/policies/api-data-usage-policies](https://openai.com/policies/api-data-usage-policies)

## Koeiromap API
ChatVRM uses Koemotion's Koeiromap API for text-to-speech conversion of response texts.

For the specifications and terms of use of the Koeiromap API, please refer to the following links and the official website:

- [https://koemotion.rinna.co.jp/](https://koemotion.rinna.co.jp/)

## Credits
The 3D room model used in this project is provided by [Spark Games](https://spark-games.co.uk/) under the Creative Commons Attribution (CC-BY) license.
