import Phaser from "phaser";
import GameOver from "./GameOver";

let space;
let backgroundVelocity;
let ship;
let enemies;
let enemyShots;
let cursors;
let addEnemiesDelay = 3500;
let addEnemyShotsDelay = 2500;
let isGameOver = false;
let enemyShotTimer;
let playerScore = 0;
let scoreText;
let sfx;
let soundOn;
let soundOff;
let isMultiPlayer = false;

class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "playerFire");
  }
  fire(x, y) {
    this.body.reset(x, y);

    this.setActive(true);
    this.setVisible(true);

    this.setVelocityY(-600);
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y <= 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

class LaserGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Laser,
      frameQuantity: 30,
      active: false,
      visible: false,
      key: "playerFire",
    });
  }

  fireLaser(x, y) {
    const laser = this.getFirstDead(false);
    if (laser) {
      laser.fire(x, y);
    }
  }
}

class PlayGame extends Phaser.Scene {
  constructor() {
    super({
      key: "PlayGame",
    });
    this.LaserGroup;
  }

  init (data) {
    isGameOver = data.isGameOver;
  }

  preload() {
    this.load.image("space", require("./assets/space.png"));
    this.load.image("playerFire", require("./assets/shot.png"));

    this.load.spritesheet("ship", require("./assets/ship.png"), {
      frameWidth: 75,
      frameHeight: 160,
    });

    this.load.spritesheet("enemy", require("./assets/enemy.png"), {
      frameWidth: 35,
      frameHeight: 125,
    });

    this.load.spritesheet("explosion", require("./assets/explosion.png"), {
      frameWidth: 152,
      frameHeight: 150,
    });

    this.load.spritesheet("enemyShot", require("./assets/enemyShot.png"), {
      frameWidth: 34,
      frameHeight: 64,
    });

    this.load.audio("gameMusic", require("./assets/space_music.ogg"));
    this.load.audio("explosionSound", require("./assets/explosion.wav"));
    this.load.audio("shotSound", require("./assets/shot.wav"));
  }

  create() {
    space = this.add.tileSprite(0, 0, 800, 600, "space").setOrigin(0, 0);
    backgroundVelocity = -1;

    this.LaserGroup = new LaserGroup(this);

    ship = this.physics.add.sprite(400, 500, "ship").setScale(0.4);
    ship.setBounce(0.2);
    ship.setCollideWorldBounds(true);

    enemyShots = this.physics.add.group();
    enemies = this.physics.add.group();

    this.time.addEvent({
      delay: addEnemiesDelay,
      callback: addEnemies,
      callbackScope: this,
      loop: true,
    });

    enemyShotTimer = this.time.addEvent({
      delay: addEnemyShotsDelay,
      callback: addEnemyShots,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 15000,
      callback: difficulty,
      callbackScope: this,
      loop: true,
    });

    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNames("ship", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemyFly",
      frames: this.anims.generateFrameNames("enemy", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "shotFired",
      frames: this.anims.generateFrameNames("enemyShot", { start: 0, end: 11 }),
      frameRate: 8,
      repeat: 6,
    });

    this.anims.create({
      key: "shipExplosion",
      frames: this.anims.generateFrameNames("explosion", { start: 0, end: 11 }),
      frameRate: 10,
      repeat: 0,
    });

    sfx = {
      music: this.sound.add("gameMusic", {volume: 0.5}),
      shot: this.sound.add("shotSound"),
      explosion: this.sound.add("explosionSound")
    };

    sfx.music.play();

    soundOn = this.add.image(750, 550, "soundOn").setScale(0.15).setOrigin(0, 0);
    soundOff = this.add.image(750, 550, "soundOff").setScale(0.15).setOrigin(0, 0);

    soundOff.visible = false;

    soundOn.setInteractive().on("pointerdown", () => {
      soundOn.visible = false;
      soundOff.visible = true;
      sfx.music.mute = true;
    });

    soundOff.setInteractive().on("pointerdown", () => {
      soundOn.visible = true;
      soundOff.visible = false;
      sfx.music.mute = false;
    });


    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(32, 32, "Ships Destroyed: 0", {
      fontSize: "28px",
      fill: "#FFFFFF",
      fontFamily: "Orbitron",
    });

    this.physics.add.collider(ship, enemies, hitShip, null, this);
    this.physics.add.overlap(ship, enemyShots, hitShip, null, this);
    this.physics.add.overlap(enemies, this.LaserGroup, hitEnemy, null, this);
  }

  update(time, delta) {
    space.tilePositionY += backgroundVelocity;

    ship.anims.play("fly", true);

    enemies.children.iterate((child) => {
      child.play("enemyFly", true);
      child.setVelocityY(40);
    });

    enemyShots.children.iterate((child) => {
      child.play("shotFired", true);
      child.setVelocityY(200);
    });

    if (isGameOver) {
      this.scene.stop("PlayGame");
      this.scene.start("GameOver", { score: playerScore, isMultiPlayer: isMultiPlayer });
      sfx.music.stop();
      isGameOver = false;
      playerScore = 0;
    }

    if (cursors.left.isDown && cursors.up.isDown) {
      ship.setVelocityX(-200);
      ship.setVelocityY(-200);
    }

    if (cursors.right.isDown && cursors.up.isDown) {
      ship.setVelocityX(200);
      ship.setVelocityY(-200);
    }

    if (cursors.right.isDown && cursors.down.isDown) {
      ship.setVelocityX(200);
      ship.setVelocityY(200);
    }

    if (cursors.left.isDown && cursors.down.isDown) {
      ship.setVelocityX(-200);
      ship.setVelocityY(200);
    }

    if (cursors.up.isDown) {
      ship.setVelocityY(-200);
    } else if (cursors.down.isDown) {
      ship.setVelocityY(200);
    } else {
      ship.setVelocityY(0);
    }

    if (cursors.left.isDown) {
      ship.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      ship.setVelocityX(200);
    } else {
      ship.setVelocityX(0);
    }

    this.inputKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ];

    this.inputKeys.forEach((key) => {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        this.shootLaser();
      }
    });
  }
  shootLaser() {
    sfx.shot.play();
    this.LaserGroup.fireLaser(ship.x, ship.y - 20);
  }
}

function addEnemies() {
  let enemy = this.physics.add
    .sprite(Phaser.Math.Between(35, this.game.config.width - 35), -75, "enemy")
    .setScale(0.6);
  enemies.add(enemy);
}

function addEnemyShots() {
  enemies.children.iterate((child) => {
    if (child.active !== false) {
      let shot = this.physics.add.sprite(child.x, child.y + 50, "enemyShot");
      enemyShots.add(shot);
    }
  });
}

function hitShip(ship, enemyObject) {
  sfx.explosion.play();
  enemyShotTimer.destroy();
  enemyObject.disableBody(true, true);
  ship.disableBody(true, true);

  let explosion = this.physics.add
    .sprite(ship.x, ship.y, "explosion")
    .setScale(0.6);
  explosion.anims.play("shipExplosion", true);

  this.physics.pause();

  backgroundVelocity = 0;

  isGameOver = true;
}

function hitEnemy(enemy, fire) {
  playerScore++;
  scoreText.setText(`Ships Destroyed: ${playerScore}`);

  sfx.explosion.play();

  enemies.remove(enemy, true, true);
  enemy.active = false;

  let explosion = this.physics.add
    .sprite(enemy.x, enemy.y, "explosion")
    .setScale(0.6);
  explosion.anims.play("shipExplosion", true);
}

function difficulty() {
  backgroundVelocity -= 0.2;
  addEnemiesDelay -= 200;
}

export default PlayGame;
