import Phaser from "phaser";

let playAgain;
let highscore;
let score;

class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  init(data) {
    this.score = data.score;
  }

  preload() {}

  create() {
    this.add.tileSprite(0, 0, 800, 600, "space").setOrigin(0, 0);

    this.add.text(200, 100, "GAME OVER", {
      fill: "#FFFFFF",
      fontSize: "60px",
      fontFamily: "Orbitron",
    });

    this.add.text(200, 100, `Score: ${score}`, {
      fill: "#FFFFFF",
      fontSize: "20px",
      fontFamily: "Orbitron",
    });

    playAgain = this.add.text(290, 300, "PLAY AGAIN", {
      fill: "#FFFFFF",
      fontSize: "35px",
      fontFamily: "Orbitron",
    });

    highscore = this.add.text(290, 350, "HIGHSCORE", {
      fill: "#FFFFFF",
      fontSize: "35px",
      fontFamily: "Orbitron",
    });

    playAgain.setInteractive().on("pointerdown", () => {
      gameOver = false;
      this.scene.stop("GameOver");
      this.scene.start("PlayGame");
    });
  }

  update() {}
}

export default GameOver;