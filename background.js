const SIMILARITY_THRESHOLD = 0.5;

function getLastLine(text) {
  const lines = text.split('\n');
  return lines[lines.length - 1];
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Emoji Camera extension installed");
  });

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'takePhoto') {
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL("camera.html"),
      type: "popup",
      width: 800,
      height: 700
    });
    chrome.storage.local.set({ emoji: message.data });
  }

    if (message.action === 'photoTaken') {
      console.log("Photo taken")
      const result = await chrome.storage.local.get(['emoji']);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer $OPENAI TOKEN`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 300,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Please answer how close the human in this image is mimicking the ${result.emoji}
                    The closer the image is to the ${result.emoji}, the higher score it will get.
                    It needs to be a score between 0 and 100, read it as a %.
                    Please notice for some ${result.emoji}s, like animals, and buildings for example;
                    It's OK if the human is just pretending to be that ${result.emoji}.
                    Please keep your answer to 1 super funny line plus the score in another line.
                    Make your reasoning funny and make sure to print JUST the score as the last line of your response
                    `
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: message.image
                    },
                  }
                ]
              }
            ]
          })
        })
      const json = await response.json();
      console.log('Success:', json);
      const description = json.choices[0].message.content;
      chrome.storage.local.set({ response: description });
      sendResponse({ success: true, data: json });
      chrome.runtime.sendMessage({ action: 'setResponse', data:  });
      chrome.tabs.query({}, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[1].id,
          {
            action: "speak",
            text: description
          }
        );
      })

      try {
        var similarity_score = parseFloat(getLastLine(description));
        if (isNaN(similarity_score)) {
            similarity_score = 0.0;
        }
      } catch (error) {
          similarity_score = 0.0;
      }
      
      console.log('Success:', similarity_score);
      sendResponse({ success: true, data: data });
      if(similarity_score <= SIMILARITY_THRESHOLD){
        chrome.tabs.query({}, function (tabs) {
          for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.remove(tabs[i].id);
          }
        });
      }
    return true; // Keeps the message channel open for sendResponse
  }
});
