const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;
ctx.lineWidth = 2;
ctx.lineCap = 'round';

let startX, startY;
let isDrawing = false;
let lastX, lastY;
let imgURL = "";
let isDarkMode = false;
let preview;

function theme() {
    if (isDarkMode) {

        document.body.style.backgroundColor = "#3d3d3d";
        document.body.style.color = "white";


        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "white";
    } else {
        document.body.style.backgroundColor = "#f0f4f8";
        document.body.style.color = "black";

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
    }
}

function saveCanvas() {
    const url = canvas.toDataURL("image/png");
    localStorage.setItem("canvasData", url);
}

function saveDarkMode() {
    localStorage.setItem("isDarkMode", isDarkMode);
}

window.onload = function () {
    const dark = localStorage.getItem("isDarkMode");
    if (dark === "true") {
        isDarkMode = true;
        theme();
    }

    const savedData = localStorage.getItem("canvasData");
    if (savedData) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = savedData;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
    }
};

let currentTool = "none";
document.querySelectorAll("button").forEach(button => {
    button.onclick = () => {
        document.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        if (button.id === "clear") {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            localStorage.removeItem("canvasData");
            return;
        }

        if (button.id == "darkmode") {
            isDarkMode = !isDarkMode;
            theme();
            saveCanvas();
            saveDarkMode();
            return;
        }

        currentTool = button.id;
    };
});


function setPosition(e) {
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function startDrawing(e) {
    setPosition(e);
    startX = lastX;
    startY = lastY;
    isDrawing = true;
    preview = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function stopDrawing(e) {

    if (!isDrawing) return;
    setPosition(e);
    const width = lastX - startX;
    const height = lastY - startY;

    if (currentTool == "image") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const x = width < 0 ? lastX : startX;
        const y = height < 0 ? lastY : startY;
        img.src = `https://picsum.photos/${Math.abs(width)}/${Math.abs(height)}`;
        img.onload = function () {
            ctx.drawImage(img, x, y, Math.abs(width), Math.abs(height));
            preview = ctx.getImageData(0, 0, canvas.width, canvas.height);
            saveCanvas();
        }
        isDrawing = false;
        return;
    }

    if (currentTool == "brush") {
        isDrawing = false;
        saveCanvas();
        return;
    }

    ctx.putImageData(preview, 0, 0);



    if (currentTool == "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
    }

    else if (currentTool == "rectangle") {
        ctx.strokeRect(startX, startY, width, height);
    }

    else if (currentTool == "square") {
        const side = Math.max(Math.abs(width), Math.abs(height));
        const x = width < 0 ? startX - side : startX;
        const y = height < 0 ? startY - side : startY;
        ctx.strokeRect(x, y, side, side);
    }

    else if (currentTool == "circle") {
        const radius = Math.sqrt(width * width + height * height)
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    else if (currentTool == "triangle") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(lastX, lastY);
        ctx.lineTo(startX * 2 - lastX, lastY);
        ctx.closePath();
        ctx.stroke();
    }


    isDrawing = false;
    ctx.beginPath();
    saveCanvas();
}

function draw(e) {
    if (!isDrawing) return;
    if (currentTool === "brush") {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        setPosition(e);
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
        return;
    }

    setPosition(e);

    const width = lastX - startX;
    const height = lastY - startY;

    ctx.putImageData(preview, 0, 0);

    ctx.beginPath();

    if (currentTool == "line") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
    }

    else if (currentTool == "rectangle") {
        ctx.strokeRect(startX, startY, width, height);
    }

    else if (currentTool == "square") {
        const side = Math.max(Math.abs(width), Math.abs(height));
        const x = width < 0 ? startX - side : startX;
        const y = height < 0 ? startY - side : startY;
        ctx.strokeRect(x, y, side, side);
    }

    else if (currentTool == "circle") {
        const radius = Math.sqrt(width * width + height * height);
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    else if (currentTool == "triangle") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(lastX, lastY);
        ctx.lineTo(startX * 2 - lastX, lastY);
        ctx.closePath();
        ctx.stroke();
    }
    else if (currentTool == "image") {
        ctx.strokeRect(startX, startY, width, height);
    }

}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
document.addEventListener('mouseup', stopDrawing); 
