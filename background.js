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
            'Authorization': `Bearer API_TOKEN`,
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
                    The lower the score, the more distant the image from the ${result.emoji}.
                    It needs to be a score between 0 and 1.
                    Please notice for some ${result.emoji}s, like animals, and buildings for example;
                    It's OK if the human is just pretending to be that ${result.emoji}.
                    Make your reasoning funny and make sure to print JUST the score as the last line of your response`
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
        chrome.storage.local.set({ response: json.choices[0].message.content });
        sendResponse({ success: true, data: json });
        chrome.runtime.sendMessage({ action: 'setResponse', data: json.choices[0].message.content });
        return true; // Keeps the message channel open for sendResponse
      }
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'closeAllTabs') {
    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        chrome.tabs.remove(tabs[i].id);
      }
    });
  }
});
