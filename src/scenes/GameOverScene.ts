import Scene from "./Scene";
import type Game from "../core/game";


export default class GameOverScene extends Scene
{
	private readonly _click:() => void;

	public constructor(game:Game)
	{
		super(game);

		this._click = ():void =>
		{
			// game.switchScene(new SurvivalScene(game));
		};

		document.addEventListener("click", this._click);
	}

	public override async initialize():Promise<void>
	{
	}

	public override start():void
	{
		document.exitPointerLock();
	}

	public override update():void
	{
	}

	public override destroy():void
	{
		document.removeEventListener("click", this._click);
	}
}
