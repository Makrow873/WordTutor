const MainPage = document.getElementById("MainPage");
const levelSelectionPage = document.getElementById("levelSelectionPage");

let pageLoading;
let words;

window.onload = function () {
    let selectedLevel = localStorage.getItem("selectedLevel");
    
    // Eğer seviye seçilmişse, seviyeyi yükle ve ana sayfayı göster
    if (selectedLevel) {
        pageLoading = true;
        startLearningFromStorage(selectedLevel);
        levelSelectionPage.style.display = "none";
        MainPage.style.display = "flex";
        document.getElementById("correctCount").innerText = localStorage.getItem("correctCount");
        document.getElementById("wrongCount").innerText = localStorage.getItem("wrongCount");
    } else {
        levelSelectionPage.style.display = "flex";
        MainPage.style.display = "none";
        localStorage.setItem("currentWordIndex", 0);
        localStorage.setItem("correctCount", 0);
        localStorage.setItem("wrongCount", 0);
        localStorage.setItem("correctWords", JSON.stringify([]));
        localStorage.setItem("wrongWords", JSON.stringify([]));
    }
};

function startLearning() {
    localStorage.setItem("selectedLevel", document.getElementById("level").value);

    levelSelectionPage.style.display = "none";
    MainPage.style.display = "flex";
    startLearningFromStorage(localStorage.getItem("selectedLevel"));
}

function startLearningFromStorage(level) {
    fetch("data.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Veri yüklenemedi!");
            }
            return response.json();
        })
        .then(data => {
            words = data[level];
            showWord();
        })
        .catch(error => {
            console.error("Error loading data:", error);
            alert("Kelime verisi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        });
}

function showWord() {
    if (localStorage.getItem("currentWordIndex") >= words.length) {
        alert("Tüm kelimeleri tamamladınız!");
        return;
    }
    let wordObj = words[localStorage.getItem("currentWordIndex")];
    document.getElementById("word").innerText = wordObj.word;
    document.getElementById("audio").src = wordObj.audio;

    playAudio();
}

// Kullanıcının girdisini kontrol et
function checkAnswer() {
    let correctCount = localStorage.getItem("correctCount");
    let wrongCount = localStorage.getItem("wrongCount");

    let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
    let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

    let currentWordIndex = localStorage.getItem("currentWordIndex");
    
    let userInput = document.getElementById("userInput").value.trim().toLowerCase();
    let correctAnswer = words[localStorage.getItem("currentWordIndex")].meaning.toLowerCase();

    if (userInput === correctAnswer) {
        correctCount++;
        localStorage.setItem("correctCount", correctCount);
        correctWords.push(words[currentWordIndex]);
        localStorage.setItem("correctWords", JSON.stringify(correctWords));
    } else {
        wrongCount++;
        localStorage.setItem("wrongCount", wrongCount);
        wrongWords.push(words[currentWordIndex]);
        console.log(words[currentWordIndex]);
        
        localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
    }

    updateScore();
    document.getElementById("userInput").value = "";
    currentWordIndex++;
    localStorage.setItem("currentWordIndex", currentWordIndex);
    showWord();
}

// Doğru ve yanlış sayısını güncelle
function updateScore() {
    let correctCount = localStorage.getItem("correctCount");
    let wrongCount = localStorage.getItem("wrongCount");
    document.getElementById("correctCount").innerText = correctCount;
    document.getElementById("wrongCount").innerText = wrongCount;
}

// Bir sonraki kelimeye geç
function skipWord() {
    let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];
    
    let wrongCount = localStorage.getItem("wrongCount");
    let currentWordIndex = localStorage.getItem("currentWordIndex");

    wrongCount++;
    wrongWords.push(words[currentWordIndex]);

    localStorage.setItem("wrongCount", wrongCount);
    localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
    updateScore();
    currentWordIndex++;
    localStorage.setItem("currentWordIndex", currentWordIndex);
    showWord();
}

// Doğru bilinen kelimeler kutusuna tıklanınca doğru kelimeleri göster
document.getElementById("correctCount").parentElement.addEventListener("click", function () {
    let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];

    openPopup(correctWords, "Doğru Bilinen Kelimeler");
});

// Yanlış bilinen kelimeler kutusuna tıklanınca yanlış kelimeleri göster
document.getElementById("wrongCount").parentElement.addEventListener("click", function () {
    let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

    openPopup(wrongWords, "Yanlış Bilinen Kelimeler");
});

// Popup'ta kelimeleri göster ve başlık metnini değiştir
function openPopup(wordsList, title) {
    let popupList = document.getElementById("popupList");
    let popupHeader = document.getElementById("text");  // Başlık elemanını al
    
    popupList.innerHTML = "";  // Popup içeriğini temizle
    wordsList.forEach(wordObj => {
        let listItem = document.createElement("li");        
        // Anlam ve örneği ekle
        listItem.innerHTML = `<strong>${wordObj.word}</strong>: ${wordObj.meaning}<br><em>Örnek: ${wordObj.example}</em>`;
        popupList.appendChild(listItem);
    });

    popupHeader.innerText = title;  // Başlık metnini güncelle
    document.getElementById("popup").style.display = "flex";  // Popup'ı göster
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function playAudio() {
    if (!pageLoading) {
        let audio = document.getElementById("audio");
        let wordObj = words[localStorage.getItem("currentWordIndex")]; // Mevcut kelimeyi al
        audio.src = wordObj.audio; // Ses kaynağını kelimenin ses dosyasına ayarla
        audio.play(); // Ses dosyasını çal
    } else {
        pageLoading = false;
    }
}
