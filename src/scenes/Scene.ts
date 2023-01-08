import type Game from "../core/game";


export default abstract class Scene
{
	protected readonly game:Game;

	public constructor(game:Game)
	{
		this.game = game;
	}

	public abstract initialize():Promise<void>;
	public abstract start():void;
	public abstract update(dt:number):void;
	public abstract destroy():void;
}
