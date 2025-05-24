const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設定畫布大小
canvas.width = 800;
canvas.height = 400;

// 主角屬性
const player = {
    x: 50,
    y: 300,
    width: 60, // 放大主角寬度
    height: 150, // 放大主角高度
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    jumping: false
};

// 新增長矛屬性
const spear = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    width: 60, // 放大三叉戟寬度
    height: 30, // 放大三叉戟高度
    speed: 5,
    active: false,
    returning: false
};

// 新增攻擊冷卻時間
let attackCooldown = false;

// 新增主角圖片方向
let playerFacingRight = true;

// 載入主角圖片
const playerImage = new Image();
playerImage.src = '1.png';

// 載入敵人圖片
const enemyImage = new Image();
enemyImage.src = '2.png';

// 載入三叉戟圖片
const spearImage = new Image();
spearImage.src = '3.png';

// 繪製技能按鈕
const skillButton = {
    x: 170, // 血條右側
    y: 50,
    width: 50,
    height: 50
};
const skillImage = new Image();
skillImage.src = '4.png';

// 載入閃電圖片
const lightningImage = new Image();
lightningImage.src = '5.png';

// 敵人屬性
const enemies = [
    { x: 400, y: 300, width: 30, height: 50, color: 'red' },
    { x: 600, y: 300, width: 30, height: 50, color: 'red' }
];

// 新增分數屬性
let score = 0;
const targetScore = 50;

// 新增血量屬性
let health = 150;

// 新增技能分數屬性
let skillScore = 0;
let skillActive = false;
let skillDuration = 5000; // 技能持續時間 5 秒

// 修改閃電繪製邏輯，確保閃電出現在畫面上方
let lightningVisible = false;
let lightningX = canvas.width / 2 - 50;
let lightningY = 0;

// 新增 BOSS 血量屬性
let bossHealth = 500;
let bossActive = false;

// 新增 BOSS 屬性
const boss = {
    x: canvas.width - 100, // 出生在畫布右方
    y: canvas.height - 200, // 保持在地面上
    width: 300,
    height: 400,
    image: new Image()
};
boss.image.src = '6.png';

// 新增 BOSS 攻擊屬性
const bossAttacks = [];

// 新增 BOSS 計時器屬性
let bossTimer = 100; // 將 BOSS 計時器時間加到 100 秒
let bossHits = 0; // 紀錄主角被 BOSS 攻擊的次數

// 新增死光觸擊次數屬性
let deathRayHits = 0;

// 載入紅圈圖片
const redCircleImage = new Image();
redCircleImage.src = '7.png';

// 鍵盤事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') {
        player.dx = player.speed;
        playerFacingRight = true; // 面向右
    }
    if (e.key === 'a' || e.key === 'A') {
        player.dx = -player.speed;
        playerFacingRight = false; // 面向左
    }
    if (e.key === ' ' && !player.jumping) {
        player.dy = -15;
        player.jumping = true;
    }
    if (e.key === 'f' && !attackCooldown && !spear.active) {
        spear.active = true;
        spear.returning = false;
        spear.x = player.x + player.width / 2;
        spear.y = player.y + player.height / 2;
        attackCooldown = true;
        setTimeout(() => {
            attackCooldown = false;
        }, 1000); // 冷卻時間 1 秒
    }
    // 修改技能效果：按下 R 會有三叉戟從天上快速降下來擊殺敵人
    if (e.key === 'r' || e.key === 'R') {
        if (skillScore >= 5 && !skillActive) {
            skillScore = 0; // 重置技能分數
            skillActive = true; // 啟動技能
            lightningVisible = true; // 顯示閃電

            // 技能效果：三叉戟從天上快速降下
            const tridents = [];
            for (let i = 0; i < 5; i++) {
                tridents.push({
                    x: Math.random() * canvas.width,
                    y: -50, // 從畫布上方生成
                    width: 30,
                    height: 100,
                    speed: 10
                });
            }

            const tridentInterval = setInterval(() => {
                tridents.forEach((trident, index) => {
                    trident.y += trident.speed;

                    // 檢測三叉戟是否擊中敵人
                    enemies.forEach((enemy, enemyIndex) => {
                        if (
                            trident.x < enemy.x + enemy.width &&
                            trident.x + trident.width > enemy.x &&
                            trident.y < enemy.y + enemy.height &&
                            trident.y + trident.height > enemy.y
                        ) {
                            enemies.splice(enemyIndex, 1); // 移除敵人
                            score++; // 增加擊殺分數
                        }
                    });

                    // 移除超出畫布的三叉戟
                    if (trident.y > canvas.height) {
                        tridents.splice(index, 1);
                    }
                });

                // 停止技能效果
                if (tridents.length === 0) {
                    clearInterval(tridentInterval);
                    skillActive = false;
                    lightningVisible = false; // 隱藏閃電
                }
            }, 50);
        }
    }
    // 新增按下 L 時擊殺分數瞬間到達 50
    if (e.key === 'l' || e.key === 'L') {
        score = 50; // 將擊殺分數設為 50
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'd' || e.key === 'D' || e.key === 'a' || e.key === 'A') player.dx = 0;
});

// 更新敵人生成邏輯
function spawnEnemy() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const enemy = {
        x: side === 'left' ? 0 : canvas.width - 30,
        y: canvas.height - 50 - 160, // 保持在地面上
        width: 80,
        height: 160,
        color: 'red',
        speed: 1 // 敵人移動速度
    };
    enemies.push(enemy);
}

// 更新遊戲邏輯
function update() {
    player.x += player.dx;
    player.y += player.dy;

    // 重力效果
    if (player.y + player.height < canvas.height - 50) {
        player.dy += 1;
    } else {
        player.dy = 0;
        player.jumping = false;
        player.y = canvas.height - 50 - player.height; // 保持主角在地面上
    }

    // 碰撞檢測與敵人移除
    enemies.forEach((enemy, index) => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            enemies.splice(index, 1); // 移除敵人
            health -= 10; // 扣血
            if (health <= 0) {
                alert('遊戲結束！');
                health = 150; // 重置血量
                score = 0; // 重置分數
                skillScore = 0; // 重置技能分數
                enemies.length = 0; // 清空敵人
                bossActive = false; // 重置 BOSS
                bossHealth = 500; // 重置 BOSS 血量
                bossAttacks.length = 0; // 清空 BOSS 攻擊
                lightningVisible = false; // 隱藏閃電
                player.x = 50; // 重置主角位置
                player.y = canvas.height - 50 - player.height; // 重置主角位置
            }
        }
    });

    // 保持敵人在地面上並向主角移動
    enemies.forEach((enemy) => {
        enemy.y = canvas.height - 50 - enemy.height;
        if (enemy.x < player.x) {
            enemy.x += enemy.speed;
        } else if (enemy.x > player.x) {
            enemy.x -= enemy.speed;
        }
    });

    // 限制主角在畫布內
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // 更新長矛邏輯
    if (spear.active) {
        if (!spear.returning) {
            spear.x += playerFacingRight ? spear.speed : -spear.speed;
            if (spear.x > canvas.width || spear.x < 0) {
                spear.returning = true;
            }
        } else {
            spear.x += playerFacingRight ? -spear.speed : spear.speed;
            if ((playerFacingRight && spear.x <= player.x + player.width / 2) ||
                (!playerFacingRight && spear.x >= player.x + player.width / 2)) {
                spear.active = false;
            }
        }
    }

    // 碰撞檢測
    if (spear.active && !spear.returning) {
        enemies.forEach((enemy, index) => {
            if (
                spear.x < enemy.x + enemy.width &&
                spear.x + spear.width > enemy.x &&
                spear.y < enemy.y + enemy.height &&
                spear.y + spear.height > enemy.y
            ) {
                enemies.splice(index, 1); // 移除敵人
                spear.returning = true; // 長矛開始返回
                score++; // 增加分數
                if (!skillActive) {
                    skillScore = Math.min(skillScore + 1, 5); // 增加技能分數，最大值為 5
                }
            }
        });
    }

    // 在更新邏輯中檢查是否需要生成 BOSS
    if (score >= targetScore && !bossActive) {
        bossActive = true;
        boss.x = canvas.width - boss.width; // 確保 BOSS 出現在右方
        boss.y = canvas.height - boss.height - 30; // 調整 BOSS 位置稍微往下
    }

    // BOSS 攻擊邏輯
    if (bossActive) {
        if (Math.random() < 0.05) { // 提高紅圈生成的機率
            bossAttacks.push({
                x: Math.random() * canvas.width,
                y: 100, // 固定在空中
                radius: 50,
                active: true,
                lineVisible: false,
                timer: 0
            });
        }

        bossAttacks.forEach((attack, index) => {
            attack.timer++;

            // 3 秒後顯示線條
            if (attack.timer === 180) {
                attack.lineVisible = true;
            }

            // 2 秒後移除攻擊
            if (attack.timer === 300) {
                bossAttacks.splice(index, 1);
            }
        });
    }

    // 在更新邏輯中檢查 BOSS 計時器
    if (bossActive) {
        if (bossTimer > 0) {
            bossTimer -= 1 / 60; // 每幀減少時間
        } else {
            alert('時間到！遊戲結束！');
            health = 150; // 重置血量
            score = 0; // 重置分數
            skillScore = 0; // 重置技能分數
            enemies.length = 0; // 清空敵人
            bossActive = false; // 重置 BOSS
            bossHealth = 500; // 重置 BOSS 血量
            bossAttacks.length = 0; // 清空 BOSS 攻擊
            lightningVisible = false; // 隱藏閃電
            player.x = 50; // 重置主角位置
            player.y = canvas.height - 50 - player.height; // 重置主角位置
            bossTimer = 30; // 重置計時器
            bossHits = 0; // 重置攻擊次數
        }

        // 碰撞檢測：主角碰到線條時增加攻擊次數
        bossAttacks.forEach((attack) => {
            if (
                attack.lineVisible &&
                player.x < attack.x + 10 &&
                player.x + player.width > attack.x - 10 &&
                player.y < canvas.height &&
                player.y + player.height > attack.y
            ) {
                bossHits++;
                if (bossHits >= 3) {
                    alert('你被 BOSS 擊中三次！遊戲結束！');
                    health = 150; // 重置血量
                    score = 0; // 重置分數
                    skillScore = 0; // 重置技能分數
                    enemies.length = 0; // 清空敵人
                    bossActive = false; // 重置 BOSS
                    bossHealth = 500; // 重置 BOSS 血量
                    bossAttacks.length = 0; // 清空 BOSS 攻擊
                    lightningVisible = false; // 隱藏閃電
                    player.x = 50; // 重置主角位置
                    player.y = canvas.height - 50 - player.height; // 重置主角位置
                    bossTimer = 30; // 重置計時器
                    bossHits = 0; // 重置攻擊次數
                }
            }
        });

        // 碰撞檢測：主角碰到線條時增加觸擊次數並移除光線
        bossAttacks.forEach((attack, index) => {
            if (
                attack.lineVisible &&
                player.x < attack.x + 10 &&
                player.x + player.width > attack.x - 10 &&
                player.y < canvas.height &&
                player.y + player.height > attack.y
            ) {
                bossAttacks.splice(index, 1); // 移除光線
                deathRayHits++; // 增加觸擊次數
                if (deathRayHits >= 3) {
                    alert('你被死光擊中三次！遊戲結束！');
                    health = 150; // 重置血量
                    score = 0; // 重置分數
                    skillScore = 0; // 重置技能分數
                    enemies.length = 0; // 清空敵人
                    bossActive = false; // 重置 BOSS
                    bossHealth = 500; // 重置 BOSS 血量
                    bossAttacks.length = 0; // 清空 BOSS 攻擊
                    lightningVisible = false; // 隱藏閃電
                    player.x = 50; // 重置主角位置
                    player.y = canvas.height - 50 - player.height; // 重置主角位置
                    bossTimer = 30; // 重置計時器
                    bossHits = 0; // 重置攻擊次數
                    deathRayHits = 0; // 重置死光觸擊次數
                }
            }
        });
    }
}

// 每隔一段時間生成敵人
const enemySpawnInterval = setInterval(() => {
    if (score < targetScore) {
        spawnEnemy();
    } else {
        clearInterval(enemySpawnInterval); // 停止生成敵人
    }
}, 1000);

// 繪製主角
function drawPlayer() {
    if (playerFacingRight) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.save();
        ctx.scale(-1, 1); // 水平翻轉
        ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.height);
        ctx.restore();
    }
}

// 繪製遊戲畫面
function draw() {
    // 在繪製遊戲畫面中新增背景顏色變化
    if (bossActive) {
        ctx.fillStyle = 'darkred'; // 背景變為深紅色
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布
    }

    // 繪製地面
    ctx.fillStyle = 'black';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // 繪製主角
    drawPlayer();

    // 繪製敵人
    enemies.forEach((enemy) => {
        enemy.width = 80; // 放大敵人寬度
        enemy.height = 160; // 放大敵人高度
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // 繪製長矛
    if (spear.active) {
        ctx.drawImage(spearImage, spear.x, spear.y, spear.width, spear.height);
    }

    // 繪製分數
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`目標分數: ${targetScore} / 目前擊殺: ${score}`, 10, 30);

    // 繪製血條
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 50, 150, 20); // 血條背景
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 50, health, 20); // 血量
    ctx.strokeStyle = 'black';
    ctx.strokeRect(10, 50, 150, 20); // 血條邊框

    // 繪製血量數字
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`${health} / 150`, 70, 65); // 血量數字置於血條中央

    // 繪製技能按鈕
    ctx.drawImage(skillImage, skillButton.x, skillButton.y, skillButton.width, skillButton.height);

    // 在繪製遊戲畫面中新增技能分數
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`${skillScore} / 5`, skillButton.x + 10, skillButton.y + 70);

    // 在繪製遊戲畫面中新增閃電繪製邏輯
    if (lightningVisible) {
        ctx.drawImage(lightningImage, lightningX, lightningY, 100, 150);
    }

    // 在繪製遊戲畫面中新增 BOSS 血條
    if (bossActive) {
        // 繪製 BOSS 血條
        ctx.fillStyle = 'red';
        ctx.fillRect(canvas.width / 2 - 150, 50, 300, 20); // 血條背景
        ctx.fillStyle = 'green';
        ctx.fillRect(canvas.width / 2 - 150, 50, (bossHealth / 500) * 300, 20); // 血量
        ctx.strokeStyle = 'black';
        ctx.strokeRect(canvas.width / 2 - 150, 50, 300, 20); // 血條邊框

        // 繪製 BOSS 名稱
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('BOSS 赫卡忒', canvas.width / 2 - 50, 45);

        // 在繪製遊戲畫面中新增 BOSS 繪製邏輯
        ctx.drawImage(boss.image, boss.x, boss.y, boss.width, boss.height);

        // 在繪製遊戲畫面中新增 BOSS 計時器
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`倒計時: ${Math.ceil(bossTimer)} 秒`, canvas.width / 2 - 50, 30);
    }

    // 在繪製遊戲畫面中使用紅圈圖片
    bossAttacks.forEach((attack) => {
        if (attack.active) {
            // 繪製紅圈圖片
            ctx.drawImage(redCircleImage, attack.x - attack.radius, attack.y - attack.radius, attack.radius * 2, attack.radius * 2);
        }

        if (attack.lineVisible) {
            // 繪製線條
            ctx.beginPath();
            ctx.moveTo(attack.x, attack.y);
            ctx.lineTo(attack.x, canvas.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 10;
            ctx.stroke();
        }
    });

    // 在繪製遊戲畫面中新增死光觸擊次數顯示
    ctx.fillStyle = 'red'; // 將文字顏色改為紅色
    ctx.font = '20px Arial';
    ctx.fillText(`死光觸擊: 3 / ${deathRayHits}`, canvas.width - 200, canvas.height - 20);
}

// 遊戲主迴圈
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();