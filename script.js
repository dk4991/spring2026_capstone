const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const msgEl = document.getElementById('msg');
const overlay = document.getElementById('overlay');
const evalEl = document.getElementById('final-eval');

const gridSize = 50;
let age = 0;
let score = 0;
let maxAge = 80 + Math.floor(Math.random() * 21);
let pieces = []; 
let activeDrop = null; 

// 强制初始化画布尺寸
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init() {
    resize();
    pieces = [];
    age = 0;
    score = 0;
    
    // 生成初始黑子和红子
    for(let i=0; i<15; i++) addPiece('black');
    for(let i=0; i<5; i++) addPiece('red');

    // 初始点：确保它在屏幕中心且对齐网格
    const startX = Math.round((canvas.width / 2) / gridSize) * gridSize;
    const startY = Math.round((canvas.height / 2) / gridSize) * gridSize;
    activeDrop = { x: startX, y: startY, visualY: startY, state: 'floating' };
}

canvas.addEventListener('mousedown', (e) => {
    if (age >= maxAge) return;

    const rect = canvas.getBoundingClientRect();
    const targetX = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
    const targetY = Math.round((e.clientY - rect.top) / gridSize) * gridSize;

    // 1. 检查位置是否占用
    if (pieces.find(p => p.x === targetX && p.y === targetY)) {
        if(msgEl) msgEl.innerText = "此地已有定数";
        return;
    }

    // 2. 邻域检查：只能在 activeDrop 附近落子
    if (activeDrop) {
        const dx = Math.abs(targetX - activeDrop.x);
        const dy = Math.abs(targetY - activeDrop.y);
        if (dx > gridSize || dy > gridSize || (dx === 0 && dy === 0)) {
            if(msgEl) msgEl.innerText = "请在当前水滴的相邻格落子";
            return;
        }
    }

    // 成功落子
    if(msgEl) msgEl.innerText = "";
    
    // 固化旧水滴
    if (activeDrop) {
        checkRedCollection(activeDrop.x, activeDrop.y);
        pieces.push({ x: activeDrop.x, y: activeDrop.y, type: 'white' });
    }

    // 更新新水滴
    activeDrop = { x: targetX, y: targetY, visualY: targetY - 100, state: 'falling' };
    age++;
    if(timerEl) timerEl.innerText = age;
    evolveWorld();
});

function addPiece(type) {
    const x = Math.floor(Math.random() * (canvas.width/gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (canvas.height/gridSize)) * gridSize;
    if (!pieces.find(p => p.x === x && p.y === y)) {
        pieces.push({ x, y, type });
    }
}

function checkRedCollection(x, y) {
    const idx = pieces.findIndex(p => p.type === 'red' && p.x === x && p.y === y);
    if (idx !== -1) {
        score++;
        if(scoreEl) scoreEl.innerText = score;
        pieces.splice(idx, 1);
    }
}

function evolveWorld() {
    if (Math.random() < 0.3) addPiece('black');
    if (age % 10 === 0) {
        let news = [];
        pieces.filter(p => p.type === 'black').forEach(b => {
            if (Math.random() > 0.8) news.push({x: b.x + gridSize, y: b.y, type: 'black'});
        });
        pieces = [...pieces, ...news];
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制暗色背景网格
    ctx.strokeStyle = "#222";
    for(let i=0; i<canvas.width; i+=gridSize) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=gridSize) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

    // 绘制棋子
    pieces.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI*2);
        if (p.type === 'white') { ctx.fillStyle = "#fff"; ctx.shadowBlur = 10; ctx.shadowColor = "#fff"; }
        else if (p.type === 'black') { ctx.fillStyle = "#000"; ctx.shadowBlur = 0; }
        else if (p.type === 'red') { ctx.fillStyle = "#f00"; ctx.shadowBlur = 15; ctx.shadowColor = "red"; }
        ctx.fill();
    });

    // 绘制当前水滴
    if (activeDrop) {
        if (activeDrop.state === 'falling' && activeDrop.visualY < activeDrop.y) activeDrop.visualY += 10;
        
        ctx.beginPath();
        ctx.arc(activeDrop.x, activeDrop.visualY, 18, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(activeDrop.x-5, activeDrop.visualY-5, 2, activeDrop.x, activeDrop.visualY, 15);
        grad.addColorStop(0, "#c8e6ff");
        grad.addColorStop(1, "#0096ff");
        ctx.fillStyle = grad;
        ctx.fill();
    }

    if (age < maxAge) requestAnimationFrame(draw);
    else {
        overlay.classList.remove('hidden');
        evalEl.innerText = `你在 ${age} 岁终结了这场棋局。共拾取了 ${score} 个红色机遇。`;
    }
}

window.addEventListener('resize', resize);
init();
draw();