let inputBox = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCIU_GWX-cnJJkNPzSfqa3yIWJNAYUxpJA";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let RequestOption = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let data = await response.json();

        if (data?.candidates?.[0]?.content?.parts?.[0]) {
            let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
            text.innerHTML = apiResponse;
        } else {
            text.innerHTML = "Error: Invalid response format from API";
        }
    } catch (error) {
        console.log(error);
        text.innerHTML = "Error: Failed to get response from AI";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

        if (image.classList.contains("choose")) {
            image.src = `image/img.svg`;
            image.classList.remove("choose");
            user.file = { mime_type: null, data: null };
        }
    }
}

function handlechatResponse(message) {
    if (!message.trim()) return;
    user.message = message;

    let html = `
        <img src="image/user.png" alt="" class="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="choosimg"/>` : ""}
        </div>
    `;
    inputBox.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="image/ai.png" alt="" class="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="image/load.gif" alt="" class="load" width="50px">
            </div>
        `;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

submitbtn.addEventListener("click", () => {
    handlechatResponse(inputBox.value);
});

inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(inputBox.value);
    }
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});
