import Game from "./core/game";
import "./main.css";
import HarvestScene from "./scenes/HarvestScene";


document.addEventListener("DOMContentLoaded", ():void =>
{
	const game = new Game();

	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	game.switchScene(new HarvestScene(game));
});
