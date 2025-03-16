const MainPage = document.getElementById("MainPage");
const levelSelectionPage = document.getElementById("levelSelectionPage");

let pageLoading;
let words;
let RepeatWords = [];
let repeatDay = false;

window.onload = function () {
    let selectedLevel = localStorage.getItem("selectedLevel");

   

    // Eğer seviye seçilmişse, seviyeyi yükle ve ana sayfayı göster
    if (selectedLevel) {
        let time = createRepeatDay(0);
        
        JSON.parse(localStorage.getItem("correctWords")).forEach(element => {            
            if (time >= new Date(element.repeatDay)) {
                RepeatWords.push(element)
                repeatDay = true;                
                localStorage.setItem("RepeatWords",JSON.stringify(RepeatWords));
            }
        });
        JSON.parse(localStorage.getItem("wrongWords")).forEach(element => {
            if (time >= new Date(element.repeatDay)) {
                RepeatWords.push(element)
                repeatDay = true;
                localStorage.setItem("RepeatWords",JSON.stringify(RepeatWords));
            }
            
        });
        
        

        levelSelectionPage.style.display = "none";
        MainPage.style.display = "flex";
        document.getElementById("correctCount").innerText = localStorage.getItem("correctCount");
        document.getElementById("wrongCount").innerText = localStorage.getItem("wrongCount");
        pageLoading = true;
        localStorage.setItem("RepeatWordIndex",0);
        if (repeatDay === false) {
            startLearningFromStorage(selectedLevel);
            
        }else{
            startLearningFromRepeatWords();
        }
        
        
    } else {
        levelSelectionPage.style.display = "flex";
        MainPage.style.display = "none";
        localStorage.setItem("currentWordIndex", 0);
        localStorage.setItem("correctCount", 0);
        localStorage.setItem("wrongCount", 0);
        localStorage.setItem("RepeatWordIndex",0);
        localStorage.setItem("correctWords", JSON.stringify([]));
        localStorage.setItem("wrongWords", JSON.stringify([]));
        localStorage.setItem("RepeatWords",JSON.stringify([]));
    }
    
};



function startLearning() {
    localStorage.setItem("selectedLevel", document.getElementById("level").value);

    levelSelectionPage.style.display = "none";
    MainPage.style.display = "flex";
    startLearningFromStorage(localStorage.getItem("selectedLevel"));
}

function startLearningFromRepeatWords() {
    console.log("Repeat");

    words = JSON.parse(localStorage.getItem("RepeatWords"));
    console.log(words);
    
    showWord();
}

function startLearningFromStorage(level) {  
    console.log("Storage");
      
    fetch("data.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Veri yüklenemedi!");
            }
            return response.json();
        })
        .then(data => {
            words = data[level];
            console.log(words);
            
            showWord();
        })
        .catch(error => {
            console.error("Error loading data:", error);
            alert("Kelime verisi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        });
}

function showWord() {
    let wordObj;
    let indexKey;
    
    if (repeatDay === true) {
        indexKey = "RepeatWordIndex"; 
    } else {
        indexKey = "currentWordIndex";
    }

    let currentIndex = localStorage.getItem(indexKey);     
    if (currentIndex >= words.length && repeatDay === false) {
        alert("Tüm kelimeleri tamamladınız!");
        return;
    }if (currentIndex >= words.length && repeatDay === true) {
        repeatDay = false;
        startLearningFromStorage(JSON.stringify(localStorage.getItem("selectedLevel")).replaceAll('"',''));
    }

    wordObj = words[currentIndex];

    document.getElementById("word").innerText = wordObj.word;
    document.getElementById("audio").src = wordObj.audio;

    playAudio();
}

// Kullanıcının girdisini kontrol et
function checkAnswer() {
    if (repeatDay === false) {
        let correctCount = localStorage.getItem("correctCount");
        let wrongCount = localStorage.getItem("wrongCount");

        let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
        let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

        let currentWordIndex = localStorage.getItem("currentWordIndex");
        
        let userInput = document.getElementById("userInput").value.trim().toLowerCase();
        let correctAnswer = words[localStorage.getItem("currentWordIndex")].meaning.toLowerCase();

        let renovatedWords ;

        if (userInput === correctAnswer) {
            correctCount++;
            localStorage.setItem("correctCount", correctCount);
            renovatedWords = words[currentWordIndex];
            renovatedWords.repeatDay = createRepeatDay(3);
            renovatedWords.knowed = true; 
            renovatedWords.trueKnowedCount++;  
            correctWords.push(renovatedWords);
            localStorage.setItem("correctWords", JSON.stringify(correctWords));
        } else {
            wrongCount++;
            localStorage.setItem("wrongCount", wrongCount);
            renovatedWords = words[currentWordIndex];
            renovatedWords.repeatDay = createRepeatDay(1);
            renovatedWords.knowed = false; 
            renovatedWords.trueKnowedCount = 0;  
            wrongWords.push(renovatedWords);
            localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
        }

        updateScore();
        document.getElementById("userInput").value = "";
        currentWordIndex++;
        localStorage.setItem("currentWordIndex", currentWordIndex);
        showWord();
    } else {
        let RepeatWordIndex = localStorage.getItem("RepeatWordIndex");
        if (words[RepeatWordIndex].knowed) {
            let correctCount = localStorage.getItem("correctCount");
            let wrongCount = localStorage.getItem("wrongCount");

            let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
            let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

            
            let userInput = document.getElementById("userInput").value.trim().toLowerCase();
            let correctAnswer = words[localStorage.getItem("RepeatWordIndex")].meaning.toLowerCase();

            let renovatedWords ;

            if (userInput === correctAnswer) {
                correctWords = correctWords.filter(item => item.word !== words[RepeatWordIndex].word);
                renovatedWords = words[RepeatWordIndex];
                renovatedWords.knowed = true; 
                renovatedWords.trueKnowedCount++;
                if (renovatedWords.trueKnowedCount > 3) {
                    renovatedWords.wordFinished = true;
                    renovatedWords.repeatDay = "";
                }else{
                    renovatedWords.repeatDay = createRepeatDay(3);

                }
                correctWords.push(renovatedWords);
                localStorage.setItem("correctWords", JSON.stringify(correctWords));
            } else {
                wrongCount++;
                correctCount--;
                localStorage.setItem("wrongCount", wrongCount);
                localStorage.setItem("correctCount", correctCount);
                correctWords = correctWords.filter(item => item.word !== words[RepeatWordIndex].word);
                renovatedWords = words[RepeatWordIndex];
                renovatedWords.repeatDay = createRepeatDay(1);
                renovatedWords.knowed = false; 
                renovatedWords.trueKnowedCount = 0; 
                wrongWords.push(renovatedWords);
                localStorage.setItem("correctWords", JSON.stringify(correctWords));
                localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
            }

            updateScore();
            document.getElementById("userInput").value = "";
            RepeatWordIndex++;
            localStorage.setItem("RepeatWordIndex", RepeatWordIndex);
            showWord();
        }else{
            let correctCount = localStorage.getItem("correctCount");
            let wrongCount = localStorage.getItem("wrongCount");

            let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
            let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

            let RepeatWordIndex = localStorage.getItem("RepeatWordIndex");
            
            let userInput = document.getElementById("userInput").value.trim().toLowerCase();
            let correctAnswer = words[localStorage.getItem("RepeatWordIndex")].meaning.toLowerCase();

            let renovatedWords ;

            if (userInput === correctAnswer) {
                correctCount++;
                wrongCount--;
                localStorage.setItem("correctCount", correctCount);
                localStorage.setItem("wrongCount", wrongCount);
                wrongWords = wrongWords.filter(item => item.word !== words[RepeatWordIndex].word);
                renovatedWords = words[RepeatWordIndex];
                renovatedWords.knowed = true; 
                renovatedWords.trueKnowedCount++;
                if (renovatedWords.trueKnowedCount > 3) {
                    renovatedWords.wordFinished = true;
                    renovatedWords.repeatDay = "";
                }else{
                    renovatedWords.repeatDay = createRepeatDay(3);

                }
                correctWords.push(renovatedWords);
                localStorage.setItem("correctWords", JSON.stringify(correctWords));
                localStorage.setItem("wrongWords", JSON.stringify(wrongWords));

            } else {
                console.log(wrongWords);
                wrongWords = wrongWords.filter(item => item.word !== words[RepeatWordIndex].word);
                console.log(wrongWords);
                
                renovatedWords = words[RepeatWordIndex];
                renovatedWords.repeatDay = createRepeatDay(1);
                renovatedWords.knowed = false; 
                renovatedWords.trueKnowedCount = 0;  
                wrongWords.push(renovatedWords);
                localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
            }

            updateScore();
            document.getElementById("userInput").value = "";
            RepeatWordIndex++;
            localStorage.setItem("RepeatWordIndex", RepeatWordIndex);
            showWord();
            }
        
    }
    
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
    if (repeatDay === false) {
        let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];
        
        let wrongCount = localStorage.getItem("wrongCount");
        let currentWordIndex = localStorage.getItem("currentWordIndex");

        wrongCount++;

        renovatedWords = words[currentWordIndex];
        renovatedWords.repeatDay = createRepeatDay(1);
        renovatedWords.knowed = false; 
        renovatedWords.trueKnowedCount = 0;  
        wrongWords.push(renovatedWords);

        localStorage.setItem("wrongCount", wrongCount);
        localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
        updateScore();
        currentWordIndex++;
        localStorage.setItem("currentWordIndex", currentWordIndex);
        showWord();
    } else {
        let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
        
        let correctCount = localStorage.getItem("correctCount");
        let RepeatWordIndex = localStorage.getItem("RepeatWordIndex");
        let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];
        let wrongCount = localStorage.getItem("wrongCount");
        if (words[RepeatWordIndex].knowed) {
            wrongCount++;
            correctCount--;
            correctWords = correctWords.filter(item => item.word !== words[RepeatWordIndex].word);
            renovatedWords = words[RepeatWordIndex];
            renovatedWords.repeatDay = createRepeatDay(1);
            renovatedWords.knowed = false; 
            renovatedWords.trueKnowedCount = 0;  
            wrongWords.push(renovatedWords);

            localStorage.setItem("wrongCount", wrongCount);
            localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
            localStorage.setItem("correctCount", correctCount);
            localStorage.setItem("correctWords", JSON.stringify(correctWords));
            updateScore();
            RepeatWordIndex++;
            localStorage.setItem("RepeatWordIndex", RepeatWordIndex);
            showWord();
        }else{
            renovatedWords = words[RepeatWordIndex];
            renovatedWords.repeatDay = createRepeatDay(1);
            renovatedWords.knowed = false; 
            renovatedWords.trueKnowedCount = 0;  
            wrongWords.push(renovatedWords);
            localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
            updateScore();
            RepeatWordIndex++;
            localStorage.setItem("RepeatWordIndex", RepeatWordIndex);
            showWord();
        }
    }
}

function createRepeatDay(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
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
    if (repeatDay === false) {
        if (!pageLoading) {
            let audio = document.getElementById("audio");
            let wordObj = words[localStorage.getItem("currentWordIndex")]; // Mevcut kelimeyi al
            audio.src = wordObj.audio; // Ses kaynağını kelimenin ses dosyasına ayarla
            audio.play(); // Ses dosyasını çal
        } else {
            pageLoading = false;
        }
    } else {
        if (!pageLoading) {
            let audio = document.getElementById("audio");
            let wordObj = words[localStorage.getItem("RepeatWordIndex")]; // Mevcut kelimeyi al
            audio.src = wordObj.audio; // Ses kaynağını kelimenin ses dosyasına ayarla
            audio.play(); // Ses dosyasını çal
        } else {
            pageLoading = false;
        }
    }
    
}

