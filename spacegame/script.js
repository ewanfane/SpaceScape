window.addEventListener('load', function () {
    let canvas = document.getElementById('canvas1');
    let ctx = canvas.getContext('2d');
    let gameMusic = new Audio('resources/space-chillout.mp3')
    let gameActive = false;
    let godMode = false;
    let hitBoxes = false;
    let aliens = [];
    let lasers = [];
    let explosions = [];
    let meteors = [];
    let ufoArray = [];
    let nukes = [];
    let bullets = [];

    let ammo = 10;
    let ammoArray = [];

    let Timer = 0;
    let score = 0;
    let gameSpeed = 2500 - score;
    let alienInterval = 100;
    let meteorInterval = 500;
    let ufoInterval = 10000;
    let nukeInterval = 30000;
    let ammoInterval = 7000;

    let Interval = 4000;

    let meteorTimer = 0
    let ufoTimer = 0;
    let nukeTimer = 0;
    let ammoTimer = 0;

    function intervalUpdater() {
        if (score < 2500) gameSpeed = 2500 - score;
        else gameSpeed = 0;
        alienInterval = gameSpeed - 3000;
        meteorInterval = gameSpeed - 2000;
        ufoInterval = gameSpeed + 2000;
    }


    let gameOver = false;
    let finalBoom = 1;


    function startGame() {
        if (!gameActive) {
            gameMusic.loop = true;
            gameMusic.play();
            draw(0);
            gameActive = true;
            loading = false;
        }
    }

    function loadingDisplay() {
        ctx.drawImage(loadingScreen, 0, 0, 799, 799)
    }
    loadingDisplay()


    let startGameButton = document.getElementById('startGame');
    let godModeButton = document.getElementById('godMode');
    let hitBoxesButton = document.getElementById('hitBoxes');

    startGameButton.onclick = function () {
        startGame()
    }
    godModeButton.onclick = function () {
        if (godMode === false) godMode = true;
        else godMode = false;
    };

    hitBoxesButton.onclick = function () {
        if (hitBoxes === false) hitBoxes = true;
        else hitBoxes = false;
    };


    class Player {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height;
            this.width = 70;
            this.height = 70;
            this.speed = 4;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.moveLeft = false;
            this.moveRight = false;
            this.moveDown = false;
            this.image = playerImage;
            this.image1 = flame;
            this.spriteWidth = 128
            this.frameX = 0;
            this.maxFrame = 7;
            this.returnSpeed = 4;
            this.sound = new Audio('resources/space-rocket.wav')
            this.sound.volume = 0.2;
            this.shoot = 0;
        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'green';
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            if (!gameOver) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
                ctx.drawImage(this.image1, 0, this.frameX * this.spriteWidth, this.spriteWidth, 128, this.x, this.y + (this.height - 5), this.width, this.height)
            }
        }

        update(deltaTime) {
            this.sound.play();

            // Movement control
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) {
                    this.frameX += 1
                } else {
                    this.frameX = 0;
                }
                if (this.moveLeft === true && this.x > 0) {
                    this.x -= this.speed;
                }
                if (this.moveRight === true && this.x < canvas.width - this.width) {
                    this.x += this.speed;
                }
                if (this.moveDown === true && this.y < canvas.height - this.height * 2) {
                    this.y += this.speed;
                }
                if (this.shoot === 1) {
                    if (ammo > 0) {
                        bullets.push(new Bullet(this.x, this.y))
                        this.shoot -= 1
                        ammo -= 1
                    }
                }
            } else {
                this.frameTimer += deltaTime;
            }
            if (this.y > canvas.height / 4 && !this.moveDown) {
                this.y -= this.returnSpeed;
                this.returnSpeed = (1 * (this.y - (canvas.height / 4 - 20))) / 50;
            } else { this.returnSpeed = 4 }



            // check for gameover
            if (!godMode) {
                lasers.forEach((laser, index) => {
                    if (laser.x + laser.width > this.x &&
                        laser.x < this.x + this.width &&
                        laser.y + laser.height > this.y &&
                        laser.y < this.y + this.height) {
                        gameOver = true;
                        lasers.splice(index, 1);
                        let explosion = new Explosion(player);
                        explosions.push(explosion);
                    };
                });

                aliens.forEach((alien, index) => {
                    if (alien.x + alien.width > this.x &&
                        alien.x < this.x + this.width &&
                        alien.y + alien.height > this.y &&
                        alien.y < this.y + this.height) {
                        gameOver = true;
                        aliens.splice(index, 1);
                        let explosion = new Explosion(player);
                        explosions.push(explosion);
                    };
                });

                meteors.forEach((meteor, index) => {
                    if ((meteor.x + 40) + meteor.hitWidth > this.x &&
                        (meteor.x + 40) < this.x + this.width &&
                        (meteor.y + 40) + meteor.hitHeight > this.y &&
                        (meteor.y + 40) < this.y + this.height) {
                        gameOver = true;
                        meteors.splice(index, 1);
                        let explosion = new Explosion(player);
                        explosions.push(explosion);
                    };
                });

                ufoArray.forEach((ufo, index) => {
                    if ((ufo.x + 10) + ufo.hitWidth > this.x &&
                        (ufo.x + 10) < this.x + this.width &&
                        (ufo.y + 10) + ufo.hitHeight > this.y &&
                        (ufo.y + 10) < this.y + this.height) {
                        gameOver = true;
                        ufoArray.splice(index, 1);
                        let explosion = new Explosion(player);
                        explosions.push(explosion);
                    };
                });
            }

            //Check for Nuke

            nukes.forEach((nuke, index) => {
                if (nuke.x + nuke.width > this.x &&
                    nuke.x < this.x + this.width &&
                    nuke.y + nuke.height > this.y &&
                    nuke.y < this.y + this.height) {
                    nukes.splice(index, 1);

                    meteors.forEach(meteor => {
                        explosions.push(new Explosion(meteor))
                        meteor.rtd = true;
                    });
                    aliens.forEach(alien => {
                        explosions.push(new Explosion(alien))
                        alien.rtd = true;
                    });
                    ufoArray.forEach(ufo => {
                        explosions.push(new Explosion(ufo))
                        ufo.rtd = true;
                    });
                    lasers.forEach(laser => {
                        explosions.push(new Explosion(laser))
                        laser.rtd = true;
                    });
                    score += 50;
                };
            });

            //Check for ammo

            ammoArray.forEach((ammos, index) => {
                if (ammos.x + ammos.width > this.x &&
                    ammos.x < this.x + this.width &&
                    ammos.y + ammos.height > this.y &&
                    ammos.y < this.y + this.height) {
                    ammoArray.splice(index, 1);
                    ammo += 3;
                    let ammoNoise = new Audio('resources/weapload.wav');
                    ammoNoise.play();
                }
            });


        }

    }

    class Bullet {
        constructor(x, y) {
            this.width = 32 / 4;
            this.height = 143 / 4;
            this.x = x + 30;
            this.y = y;
            this.speed = 6;
            this.rtd = false;
            this.stage = 0;
        }

        update() {
            this.y -= this.speed;
            this.stage += 1;

            if (this.stage == 1) {
                let shootNoise = new Audio('resources/shoot.wav')
                shootNoise.play();
            }

            if (this.y < 0) {
                this.rtd = true;
            }

            meteors.forEach(meteor => {
                if ((meteor.x + 40) + meteor.hitWidth > this.x &&
                    (meteor.x + 40) < this.x + this.width &&
                    (meteor.y + 40) + meteor.hitHeight > this.y &&
                    (meteor.y + 40) < this.y + this.height) {
                    this.rtd = true;
                    meteor.rtd = true;
                    explosions.push(new Explosion(meteor));
                    score += 5;
                };
            });
            ufoArray.forEach((ufo, index) => {
                if ((ufo.x + 10) + ufo.hitWidth > this.x &&
                    (ufo.x + 10) < this.x + this.width &&
                    (ufo.y + 10) + ufo.hitHeight > this.y &&
                    (ufo.y + 10) < this.y + this.height) {
                    this.rtd = true;
                    ufo.rtd = true;
                    ufoArray.splice(index, 1);
                    let explosion = new Explosion(ufo);
                    explosions.push(explosion);
                };
            });
        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'red';
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            ctx.drawImage(laserImage, this.x, this.y, this.width, this.height);
        }
    }

    class Nuke {
        constructor() {
            this.width = 80;
            this.height = 80;
            this.x = Math.random() * canvas.width;
            this.y = 0 - this.height;
            this.image = nukeImage;
            this.rtd = false;
        }

        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        }

        update() {
            this.y += 1;
            if (this.y > canvas.height + this.height) {
                this.rtd = true;
            }

        }
    }

    class Ammo {
        constructor() {
            this.width = 80;
            this.height = 80;
            this.x = Math.random() * canvas.width;
            this.y = 0 - this.height;
            this.image = ammoImage;
            this.rtd = false;
        }

        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        }

        update() {
            this.y += 1;
            if (this.y > canvas.height + this.height) {
                this.rtd = true;
            }

        }
    }

    class Explosion {
        constructor(object) {
            this.x = object.x;
            this.y = object.y;
            this.width = object.width * 1.6;
            this.height = object.height * 1.6;

            this.explosionSound = new Audio('resources/DeathFlash.flac')
            this.frameY = 0;
            this.MaxFrame = 3;
            this.SpriteSize = 64;
            this.explosionImage = explosionImage
            this.frameTimer = 0
            this.frameInterval = 200;
            this.rtd = false;
        }

        draw() {
            ctx.drawImage(this.explosionImage, this.SpriteSize, this.frameY * this.SpriteSize,
                this.SpriteSize, this.SpriteSize * (this.frameY + 1), this.x, this.y, this.width, this.height);
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameY < this.MaxFrame) {
                    this.frameY++;
                    finalBoom = 1;
                }
                else {
                    this.rtd = true;
                    if (gameOver) finalBoom = 0;
                };

                if (this.frameY === 1) {
                    this.explosionSound.play();
                }
            } else { this.frameTimer += deltaTime }


        }
    }





    class Alien {
        constructor() {
            this.width = 60;
            this.height = 60;
            this.maxHeight = 100 + (Math.floor(Math.random() * 100))
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 100;
            this.Yspeed = 1;
            this.Xspeed = Math.random() + 3;
            this.counter = 0;
            this.rtd = false;
            this.image = alien_spaceship;
            this.explode = false;

            this.laserInterval = Math.random() * 1000 + 500;
            this.despawnRate = 5;
        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'red';
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        }

        update() {
            if (this.y === canvas.height - this.maxHeight && this.counter < this.despawnRate) {
                this.Yspeed = 0;
            }

            if (this.x >= canvas.width) {
                this.Xspeed = this.Xspeed * -1;
                this.counter += 1;
            };
            if (this.x <= 0) {
                this.Xspeed = this.Xspeed * -1;
            };

            if (this.counter === this.despawnRate) {
                this.Yspeed += -1;
                this.rtd = true;
                score += 10;
            }

            this.y -= this.Yspeed;
            this.x += this.Xspeed;

        }

    }

    class Ufo {
        constructor() {
            this.width = 861 / 4;
            this.height = 557 / 4;
            this.x = 0 - this.width;
            this.y = Math.random() * 50 + 50;
            this.image = ufoImage;
            this.speed = (Math.random() * 3 + 1) / 100;
            this.amplitude = Math.random() * 40 + 80;
            this.rtd = false;

            this.hitWidth = this.width - 110;
            this.hitHeight = this.height - 60;

        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'blue'
                ctx.strokeRect(this.x + 10, this.y + 10, this.width - 110, this.height - 60)
            }
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        }

        update(deltaTime) {
            this.x += 1;
            this.y = 100 + this.amplitude * Math.sin(this.speed * this.x);

            if (this.x > canvas.width + this.width) {
                this.rtd = true;
                score += 10;
            }
        }
    }


    class Laser {
        constructor(x, y) {
            this.width = 32 / 3;
            this.height = 143 / 3;
            this.x = x - this.width / 2;
            this.y = y - this.height;
            this.speed = Math.random() * 4 + 2;
            this.sound = new Audio('resources/7.wav');
            this.sound.volume = 0.5;
            this.stage = 0
            this.explosionSound = new Audio('resources/laserd.wav')
            this.rtd = false;
        }

        update() {
            this.y -= this.speed;

            if (this.y < 0) {
                this.rtd = true;
                score += 10;
            }
            this.stage++;

            meteors.forEach(meteor => {
                if ((meteor.x + 40) + meteor.hitWidth > this.x &&
                    (meteor.x + 40) < this.x + this.width &&
                    (meteor.y + 40) + meteor.hitHeight > this.y &&
                    (meteor.y + 40) < this.y + this.height) {
                    this.rtd = true;
                    score += 5;
                    this.explosionSound.play()
                };
            });
        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'red';
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            ctx.drawImage(laserImage, this.x, this.y, this.width, this.height);
        }
    }




    class Meteor {
        constructor() {
            this.width = 241;
            this.height = 241;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.x = Math.random() * (canvas.width - this.spriteWidth);
            this.y = 0 - this.spriteHeight;

            this.image = meteorImage
            this.frameX = 0;
            this.Yspeed = Math.random() * 40 + 15;
            this.Xspeed = Math.random() * 10 - 5;


            this.hitWidth = this.spriteWidth - (this.spriteWidth * 0.4);
            this.hitHeight = this.spriteHeight - (this.spriteHeight * 0.4);

            this.frameTimer = 0
            this.frameInterval = 110;
            this.maxFrame = 3;
            this.rtd = false;
        }

        draw() {
            if (hitBoxes) {
                ctx.strokeStyle = 'blue';
                ctx.strokeRect(this.x + 40, this.y + 40, this.hitWidth, this.hitHeight)
            }
            ctx.drawImage(this.image, this.width * this.frameX, 0, this.width, this.height, this.x, this.y, this.spriteWidth, this.spriteHeight)
        }

        update(deltaTime) {
            if (this.y > canvas.height) {
                score += 15;
                this.rtd = true;
            }
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                    this.x += this.Xspeed;
                    this.y += this.Yspeed;
                    this.frameTimer = 0;
                } else {

                    this.frameX = 0;
                };

            } else { this.frameTimer += deltaTime }
        }
    }




    class Background {
        constructor() {
            this.image = backgroundImage;
            this.x = 0;
            this.y = 0;
            this.height = 800;
            this.width = 800;
            this.speed = 1;
        }
        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
            ctx.drawImage(this.image, this.x, this.y + this.height - this.speed, this.width, this.height)
        }
        update() {
            this.y += this.speed;
            if (this.y > 0) this.y = 0 - this.height;
        }
    }



    let alienSpawnTimer = 0;
    function alienHandler(deltaTime) {
        if (alienSpawnTimer > (Interval + alienInterval)) {
            let alien = new Alien();
            aliens.push(alien);

            alienSpawnTimer = 0;
        } else {
            alienSpawnTimer += deltaTime;
        }



        aliens.forEach(alien => {
            alien.draw();
            alien.update();
            if (Timer > Interval + alien.laserInterval) {
                let laser = new Laser(alien.x + alien.width / 2, alien.y);
                lasers.push(laser);
                Timer = 0;
            } else {
                Timer += deltaTime;
            }

            if (alien.explode) {
                let explosion = new Explosion(alien);
                explosions.push(explosion);
            }
        });

        lasers.forEach(laser => {
            laser.update(deltaTime);
            laser.draw();
            if (laser.stage === 1) {
                laser.sound.play();
            }
        });

        explosions.forEach(explosion => {
            explosion.draw();
            explosion.update(deltaTime);
        })

        lasers = lasers.filter(laser => !laser.rtd);
        aliens = aliens.filter(alien => !alien.rtd);
        explosions = explosions.filter(explosion => !explosion.rtd);
    }

    function meteorHandler(deltaTime) {
        if (meteorTimer > (Interval + meteorInterval)) {
            let meteor = new Meteor();
            meteors.push(meteor);
            meteorTimer = 0;
            console.log(gameSpeed)
        } else {
            meteorTimer += deltaTime;
        }

        meteors.forEach(meteor => {
            meteor.update(deltaTime);
            meteor.draw();
        });

        meteors = meteors.filter(meteor => !meteor.rtd);

    }

    function ufoHandler(deltaTime) {
        if (ufoTimer > (Interval + ufoInterval)) {
            let ufo = new Ufo();
            ufoArray.push(ufo);
            ufoTimer = 0;
        } else {
            ufoTimer += deltaTime;
        }

        ufoArray.forEach(ufo => {
            ufo.update(deltaTime);
            ufo.draw();
        });

        ufoArray = ufoArray.filter(ufo => !ufo.rtd);
    }

    function nukeHandler(deltaTime) {

        if (nukeTimer > (Interval + nukeInterval)) {
            let nuke = new Nuke();
            nukes.push(nuke);
            nukeTimer = 0;
        } else {
            nukeTimer += deltaTime;
        }

        nukes.forEach(nuke => {
            nuke.update(deltaTime);
            nuke.draw();
        });

        nukes = nukes.filter(nuke => !nuke.rtd);
    }

    function bulletHandler(deltaTime) {
        bullets.forEach(bullet => {
            bullet.update(deltaTime);
            bullet.draw();
        });

        bullets = bullets.filter(bullet => !bullet.rtd)
    }

    function ammoHandler(deltaTime) {
        if (ammoTimer > (Interval + ammoInterval)) {
            let ammos = new Ammo();
            ammoArray.push(ammos);
            ammoTimer = 0;
        } else {
            ammoTimer += deltaTime;
        }

        ammoArray.forEach(ammos => {
            ammos.update();
            ammos.draw();
        });
    }

    function scoreKeeper() {
        ctx.font = "30px serif";
        ctx.fillStyle = 'white';
        ctx.fillText("Score: " + score, 35, 35);

        ctx.font = "30px serif";
        ctx.fillStyle = 'white';
        ctx.fillText("Ammo: " + ammo, canvas.width - 160, 35);

    }

    let player = new Player();
    let background = new Background();

    window.addEventListener('keydown', activate, false);
    window.addEventListener('keyup', deactivate, false);

    let previousTime = performance.now();
    let explosionTimer = 0;
    let explosionInterval = 20;

    function draw() {
        intervalUpdater()
        let currentTime = performance.now();
        let deltaTime = (currentTime - previousTime);
        previousTime = currentTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        background.draw();
        background.update();
        player.draw();
        player.update(deltaTime);
        nukeHandler(deltaTime);
        ammoHandler(deltaTime)
        alienHandler(deltaTime);
        meteorHandler(deltaTime);
        ufoHandler(deltaTime);
        bulletHandler(deltaTime);
        scoreKeeper();

        if (gameOver && finalBoom === 0) {
            let restartButton = document.createElement('button');
            restartButton.innerHTML = 'Restart';
            restartButton.classList.add('restart');

            restartButton.onclick = function () {
                gameOver = false;
                finalBoom = 1;
                score = 0;
                aliens = [];
                lasers = [];
                explosions = [];
                meteors = [];
                ufoArray = [];
                nukes = [];
                ammoArray = [];

                Timer = 0;
                score = 0;
                ammo = 10;
                gameSpeed = 2500 - score;
                alienInterval = 100;
                meteorInterval = 500;
                ufoInterval = 10000;
                meteorTimer = 0;
                ufoTimer = 0;
                player = new Player();
                restartButton.remove();
                requestAnimationFrame(draw);
            };

            document.body.appendChild(restartButton);
        } else {
            requestAnimationFrame(draw);
        }
    }





    function activate(event) {
        let key = event.key;

        if (key === "ArrowLeft") {
            player.moveLeft = true;
        } else if (key === "ArrowRight") {
            player.moveRight = true;
        } else if (key === "ArrowDown") {
            player.moveDown = true;
        } else if (key === "ArrowUp") {
            player.shoot += 1;
        }
    }
    function deactivate(event) {
        let key = event.key;
        if (key === "ArrowLeft") {
            player.moveLeft = false;
        } else if (key === "ArrowRight") {
            player.moveRight = false;
        } else if (key === "ArrowDown") {
            player.moveDown = false;
        } else if (key === "ArrowUp") {
            player.shoot = 0;
        }
    }
});