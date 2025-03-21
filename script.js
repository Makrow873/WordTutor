const MainPage = document.getElementById("MainPage");
const levelSelectionPage = document.getElementById("levelSelectionPage");

let pageLoading;
let words;
let RepeatWords = [];
let repeatDay = false;
let startLearned = false;
let soundName;
let timeoutId;

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
        if (!startLearned) {
            document.getElementById("informationPage").style.display = "flex";
            levelSelectionPage.style.display = "none";
            MainPage.style.display = "none";
            startLearned= true;
            document.getElementsByClassName("infoButImage")[0].style.display = "flex";
            document.getElementsByClassName("infoButImage")[1].style.display = "none";
        }else{
            levelSelectionPage.style.display = "flex";
            MainPage.style.display = "none";
        }
            localStorage.setItem("currentWordIndex", 0);
            localStorage.setItem("correctCount", 0);
            localStorage.setItem("wrongCount", 0);
            localStorage.setItem("RepeatWordIndex",0);
            localStorage.setItem("correctWords", JSON.stringify([]));
            localStorage.setItem("wrongWords", JSON.stringify([]));
            localStorage.setItem("RepeatWords",JSON.stringify([]));
        
    }
    
};

function informationPopup() {    
    if (localStorage.getItem("selectedLevel") && window.getComputedStyle( document.getElementById("informationPage")).display === "none") {
        document.getElementById("informationPage").style.display = "flex";
        MainPage.style.display = "none";
        document.getElementsByClassName("infoButImage")[0].style.display = "flex";
        document.getElementsByClassName("infoButImage")[1].style.display = "none";

        return;
        
    }if(localStorage.getItem("selectedLevel") && window.getComputedStyle( document.getElementById("informationPage")).display === "flex"){
        document.getElementById("informationPage").style.display = "none";
        MainPage.style.display = "flex";
        document.getElementsByClassName("infoButImage")[0].style.display = "none";
        document.getElementsByClassName("infoButImage")[1].style.display = "flex";
        return;        
    }if (!(localStorage.getItem("selectedLevel")) && window.getComputedStyle( document.getElementById("informationPage")).display === "none") {
        document.getElementById("informationPage").style.display = "flex";
        levelSelectionPage.style.display = "none";
        document.getElementsByClassName("infoButImage")[0].style.display = "flex";
        document.getElementsByClassName("infoButImage")[1].style.display = "none";
        return;
    }if (!(localStorage.getItem("selectedLevel")) && window.getComputedStyle( document.getElementById("informationPage")).display === "flex") {
        document.getElementById("informationPage").style.display = "none";
        levelSelectionPage.style.display = "flex";
        document.getElementsByClassName("infoButImage")[0].style.display = "none";
        document.getElementsByClassName("infoButImage")[1].style.display = "flex";
        return;
    }

}

function startLearning() {
    localStorage.setItem("selectedLevel", document.getElementById("level").value);
    
    levelSelectionPage.style.display = "none";
    MainPage.style.display = "flex";
    startLearningFromStorage(localStorage.getItem("selectedLevel").replaceAll(" ",""));
}

function startLearningFromRepeatWords() {

    words = JSON.parse(localStorage.getItem("RepeatWords"));
    
    showWord();
}

function startLearningFromStorage(level) {  
      
    fetch("data.json",{method: 'GET',
        mode: 'cors', // CORS izinleri için
        cache: 'no-cache', // Önbelleği iptal et
        credentials: 'same-origin'})
        
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
    let wordObj;
    let indexKey;
    let languageLevels = ["A1","A2","B1","B2","C1"]
    if (repeatDay === true) {
        indexKey = "RepeatWordIndex"; 
    } else {
        indexKey = "currentWordIndex";
    }

    if (localStorage.getItem(indexKey) % 25 === 0 && localStorage.getItem(indexKey) != 0) {
        showAd();
        document.getElementById("ADClose").style.display = "none";
        setTimeout(() => {
            document.getElementById("ADClose").style.display = "block";
        }, 15000);
    }

    let currentIndex = localStorage.getItem(indexKey);     
    if (currentIndex >= words.length && repeatDay === false) {
        if (languageLevels[languageLevels.indexOf(localStorage.getItem("selectedLevel"))] !== "C1") {
            localStorage.setItem("selectedLevel",languageLevels[languageLevels.indexOf(localStorage.getItem("selectedLevel")) +1 ]);
            startLearningFromStorage(localStorage.getItem("selectedLevel"));
            localStorage.setItem("currentWordIndex",0);
            dalgaKonfeti(); 
            return;
        }else{

            alert("Tüm kelimeleri tamamladınız!");
            return;
        }
        
    }if (currentIndex >= words.length && repeatDay === true) {
        repeatDay = false;
        startLearningFromStorage(JSON.stringify(localStorage.getItem("selectedLevel")).replaceAll('"',''));
    }
    
    wordObj = words[currentIndex];
    
    document.getElementsByClassName("word")[0].innerText = wordObj.word;
    soundName = wordObj.word;
    
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
        let find = false;
        for (let index = 0; index < correctAnswer.length; index++) {            
            if ("," === correctAnswer[index]) {
                correctAnswer = correctAnswer.split(",");
                for (let i = 0; i < correctAnswer.length; i++) {
                    const element = correctAnswer[i].replaceAll(" ","");
                    if (element === userInput) {
                        find = true;
                    }
                }
                break;
            }
        }

        let renovatedWords ;
        console.log(correctAnswer , " ", typeof correctAnswer);
        
        if (userInput.replaceAll(" ","") === JSON.stringify(correctAnswer).replaceAll(" ","") || find) {
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
        openMeaningPage();
        timeoutId= setTimeout(() => {
            showWord();
            
        }, 5000);
    } else {
        let RepeatWordIndex = localStorage.getItem("RepeatWordIndex");
        if (words[RepeatWordIndex].knowed) {
            let correctCount = localStorage.getItem("correctCount");
            let wrongCount = localStorage.getItem("wrongCount");

            let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
            let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

            
            let userInput = document.getElementById("userInput").value.trim().toLowerCase();
            let correctAnswer = words[localStorage.getItem("RepeatWordIndex")].meaning.toLowerCase();

            let find = false;
            for (let index = 0; index < correctAnswer.length; index++) {            
                if ("," === correctAnswer[index]) {
                    correctAnswer = correctAnswer.split(",");
                    for (let i = 0; i < correctAnswer.length; i++) {
                        const element = correctAnswer[i].replaceAll(" ","");
                        if (element === userInput) {
                            find = true;
                        }
                    }
                    break;
                }
            }

            let renovatedWords ;

            if (userInput.replaceAll(" ","") === correctAnswer.replaceAll(" ","") || find) {
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
            openMeaningPage();
        timeoutId = setTimeout(() => {
            showWord();
            
        }, 5000);
        }else{
            let correctCount = localStorage.getItem("correctCount");
            let wrongCount = localStorage.getItem("wrongCount");

            let correctWords = localStorage.getItem("correctWords") ? JSON.parse(localStorage.getItem("correctWords")) : [];
            let wrongWords = localStorage.getItem("wrongWords") ? JSON.parse(localStorage.getItem("wrongWords")) : [];

            let RepeatWordIndex = localStorage.getItem("RepeatWordIndex");
            
            let userInput = document.getElementById("userInput").value.trim().toLowerCase();
            let correctAnswer = words[localStorage.getItem("RepeatWordIndex")].meaning.toLowerCase();


            let find = false;
            for (let index = 0; index < correctAnswer.length; index++) {            
                if ("," === correctAnswer[index]) {
                    correctAnswer = correctAnswer.split(",");
                    for (let i = 0; i < correctAnswer.length; i++) {
                        const element = correctAnswer[i].replaceAll(" ","");
                        if (element === userInput) {
                            find = true;
                        }
                    }
                    break;
                }
            }
            let renovatedWords ;

            if (userInput.replaceAll(" ","") === correctAnswer.replaceAll(" ","") || find) {
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
                wrongWords = wrongWords.filter(item => item.word !== words[RepeatWordIndex].word);
                
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
            openMeaningPage();
        timeoutId = setTimeout(() => {
            showWord();
            
        }, 5000);
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
        openMeaningPage();
        timeoutId = setTimeout(() => {
            showWord();
            
        }, 5000);
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
            openMeaningPage();
            timeoutId = setTimeout(() => {
                showWord();
            
            }, 5000);
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
            openMeaningPage();
            timeoutId = setTimeout(() => {
                showWord();
            
            }, 5000);
        }
    }
}

function createRepeatDay(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

function openMeaningPage(){
    document.getElementById("meaningNextButton").innerText = "Atla";
    document.getElementById("WordCard-Box").style.display = "none";
    document.getElementById("Meaning-Box").style.display = "flex";
    if (repeatDay === false) {
        let count = localStorage.getItem("currentWordIndex") -1;
        document.getElementsByClassName("word")[1].innerText = words[count].word;
        document.getElementById("meaning").innerText = words[count].meaning;
        document.getElementById("ExampleSenteces").innerText = words[count].example;

    } else {
        
        let count = localStorage.getItem("RepeatWordIndex") -1;
        document.getElementsByClassName("word")[1].innerText = words[count].word;
        document.getElementById("meaning").innerText = words[count].meaning;
        document.getElementById("ExampleSenteces").innerText = words[count].example;
    }
    
    setTimeout(() => {
        document.getElementById("WordCard-Box").style.display = "flex";
        document.getElementById("Meaning-Box").style.display = "none";
    }, 5000);
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
        listItem.onclick = function () {
            // Burada istediğin işlemi yapabilirsin
            openMeaningForListItem(wordObj.word, wordObj.meaning, wordObj.example);
        };
                    
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
            speakWord(soundName);  // Burada istediğiniz kelimeyi yazabilirsiniz
        } else {
            pageLoading = false;
        }
    } else {
        if (!pageLoading) {

            speakWord(soundName);  // Burada istediğiniz kelimeyi yazabilirsiniz
        } else {
            pageLoading = false;
        }
    }
}


function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US'; // İngilizce için 'en-US', Türkçe için 'tr-TR'
        utterance.rate = 1;
        utterance.pitch = 1;

        // 🔥 iPhone ve Safari için ekstra ses yükleme
        function loadVoices() {
            return new Promise((resolve) => {
                let voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    resolve(voices);
                } else {
                    speechSynthesis.onvoiceschanged = () => {
                        voices = speechSynthesis.getVoices();
                        resolve(voices);
                    };
                }
            });
        }

        loadVoices().then(voices => {
            const voice = voices.find(v => v.lang === 'en-US') || voices[0];
            if (voice) {
                utterance.voice = voice;
            }

            // 🔥 iPhone için ekstra tetikleme
            speechSynthesis.cancel(); // Önce iptal et (iPhone'da bazen takılıyor)
            setTimeout(() => {
                speechSynthesis.speak(utterance);
            }, 200); // Gecikme ekledik ki iPhone engellemesin
        });

    } else {
        alert('Tarayıcınız sesli okuma desteklemiyor.');
    }
}

function reset(){
    localStorage.clear();
    location.reload();
}


function dalgaKonfeti() {
    var count = 200, defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    
    setTimeout(() => {
        document.getElementById("seviye-mesaji").style.display = "none";
    }, 1500);
    document.getElementById("seviye-mesaji").style.display = "flex";
    document.getElementById("seviye-numarasi").innerText = localStorage.getItem("selectedLevel");
}

function skipWaiting() {
    if (!clickMeaningListeİtem) {
        clearTimeout(timeoutId);
        showWord();   
    }else{
        clickMeaningListeİtem = false;
    }
    
    document.getElementById("Meaning-Box").style.display = "none";
    document.getElementById("WordCard-Box").style.display = "flex";
}
let clickMeaningListeİtem = false;


function openMeaningForListItem(wordName,meaning,example){
    clickMeaningListeİtem = true;
    document.getElementById("WordCard-Box").style.display = "none";
    document.getElementById("Meaning-Box").style.display = "flex";
    document.getElementById("popup").style.display = "none";
    document.getElementsByClassName("word")[1].innerText = wordName;
    document.getElementById("meaning").innerText = meaning;
    document.getElementById("ExampleSenteces").innerText = example;
    document.getElementById("meaningNextButton").innerText = "Kapat";
}

function showAd() {
    document.getElementById('ad-popup').style.display = 'block';
}
  
function closeAd() {
    document.getElementById('ad-popup').style.display = 'none';
}