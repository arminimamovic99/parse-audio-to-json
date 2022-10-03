import { dialogue } from "./resources/example/exercise.js"
import { API_KEY, BASE_URL } from "./environment.js"

const file1Url = "https://storage.googleapis.com/bucket123-dk-mire/DK_U15D1.mp3"
const file2Url = "https://storage.googleapis.com/bucket123-dk-mire/DK_U15D2.mp3"

let dialogueIndex = 0;

function submitFileForTranscriptionAndExtractData(fileUrl, callback = false) {
    let parsedDataFromAudioFile;

    const assembly = axios.create({
        baseURL: BASE_URL,
        headers: {
        "Authorization": API_KEY,
        "content-type": "audio/wav",
        
        }
    });
    
    assembly
        .post("/transcript", {
            audio_url: fileUrl,
            speaker_labels: true
        })
        .then((parseResponse) => {
            console.log(parseResponse)
            // Interval to ping the api in order to check if the transcription is complete, if it is, we send a request to extract data
            const loop = setInterval(() => {
                assembly.get(`/transcript/${parseResponse.data.id}`)
                    .then((response) => {
                      let status = response.data.status

                       if (status === 'completed') {
                        console.log(response.data.utterances)
                        fillObject(response.data);

                        dialogueIndex++;
                        if (typeof callback === 'function' && dialogueIndex <= 1) callback?.()
                        clearInterval(loop)
                       } else {
                           console.log(status)
                       }
                    })

            }, 2000)
        })
        .catch(console.error);
}


function fillObject(data) {
    const exampleDiag = dialogue

    const iterable  = exampleDiag.
    sequences[0].
    configs[0].
    dialogueVariants[dialogueIndex]

    iterable.dialogueLines.forEach((item, i) => {
        item.text = data.utterances[i]?.text
        item.timespan.start = data.utterances[i]?.start
        item.timespan.end = data.utterances[i]?.end
    })

    if (dialogueIndex == 1) {
        document.getElementById("result-text").innerHTML = JSON.stringify(exampleDiag)
    }
    
    console.log({exampleDiag})
}
submitFileForTranscriptionAndExtractData(file1Url, function() {
    submitFileForTranscriptionAndExtractData(file2Url);
});