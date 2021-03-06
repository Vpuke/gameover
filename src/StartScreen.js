import Phaser from "phaser";
import PlayGame from "./SinglePlayer";

let SinglePlayer;
let MultiPlayer;
let soundOn;
let soundOff;
let select;

class StartScreen extends Phaser.Scene {
  constructor() {
    super({
      key: "StartScreen",
      active: true,
    });
  }

  preload() {
    this.load.image("soundOn", require("./assets/sound_on.png"));
    this.load.image("soundOff", require("./assets/sound_off.png"));
    this.load.image("background", require("./assets/space.png"));

    this.load.spritesheet("onePlayer", require("./assets/ship.png"), {
      frameWidth: 75,
      frameHeight: 160,
    });

    this.load.spritesheet("multiPlayer", require("./assets/ship2.png"), {
      frameWidth: 61,
      frameHeight: 157,
    });

    this.load.audio("select", require("./assets/select.ogg"));
  }

  create() {
    this.add.tileSprite(0, 0, 800, 600, "background").setOrigin(0, 0);

    select = this.sound.add("select");

    soundOn = this.add
      .image(750, 550, "soundOn")
      .setScale(0.15)
      .setOrigin(0, 0);
    soundOff = this.add
      .image(750, 550, "soundOff")
      .setScale(0.15)
      .setOrigin(0, 0);

    soundOff.visible = false;

    soundOn.setInteractive().on("pointerdown", () => {
      soundOn.visible = false;
      soundOff.visible = true;
    });

    soundOff.setInteractive().on("pointerdown", () => {
      soundOn.visible = true;
      soundOff.visible = false;
    });

    this.add.text(150, 100, "SPACESHOOTER", {
      fill: "#FFFFFF",
      fontSize: "50px",
      fontFamily: "Orbitron",
    });

    SinglePlayer = this.add
      .sprite(
        255,
        400,
        "onePlayer",
        [1],
        this.add.text(200, 490, "Single Player", {
          fill: "#FFFFFF",
          fontSize: "16px",
          fontFamily: "Orbitron",
        })
      )
      .setScale(0.7);
    this.add.text(165, 530, "UP, DOWN, LEFT, RIGHT, SPACE", {
      fill: "#FFFFFF",
      fontSize: "10px",
      fontFamily: "Orbitron",
    });

    SinglePlayer.setInteractive().on("pointerdown", () => {
      select.play();
      this.scene.stop("StartScreen");
      this.scene.start("PlayGame");
    });

    var MultiPlayer = this.add
      .sprite(
        540,
        400,
        "multiPlayer",
        [1],
        this.add.text(500, 490, "Multiplayer", {
          fill: "#FFFFFF",
          fontSize: "16px",
          fontFamily: "Orbitron",
        })
      )
      .setScale(0.8);
    this.add.text(508, 530, "W, S, A, D, TAB", {
      fill: "#FFFFFF",
      fontSize: "10px",
      fontFamily: "Orbitron",
    });
    MultiPlayer.setInteractive().on("pointerdown", () => {
      this.scene.stop("StartScreen");
      this.scene.stop("PlayGame");
      this.scene.start("MultiPlayer");
    });
  }
  update() {}
}

export default StartScreen;
