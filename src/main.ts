import Game from "./core/game";
import "./main.css";
import HarvestScene from "./scenes/HarvestScene";


document.addEventListener("DOMContentLoaded", ():void =>
{
	const game = new Game();
	game.switchScene(new HarvestScene(game)).catch((reason):void =>
	{
		console.log(reason);
	});
});
