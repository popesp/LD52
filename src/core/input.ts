interface KeyState
{
	down:boolean;
	pressed:boolean;
}

interface MouseState extends KeyState
{
	x:number;
	y:number;
}


export default class InputManager
{
	private readonly keyStates:Map<string, KeyState>;
	private readonly mouseState:MouseState;
	private readonly mousedown:() => void;
	private readonly mouseup:() => void;
	private readonly mousemove:(e:MouseEvent) => void;
	private readonly keyup:(e:KeyboardEvent) => void;
	private readonly keypress:(e:KeyboardEvent) => void;

	/**
	 * Create a new input manager.
	 */
	public constructor()
	{
		this.keyStates = new Map<string, KeyState>();
		this.mouseState = {
			down: false,
			pressed: false,
			x: 0,
			y: 0
		};

		this.mousedown = ():void =>
		{
			this.mouseState.down = true;
			this.mouseState.pressed = true;
		};

		this.mouseup = ():void =>
		{
			this.mouseState.down = false;
		};

		this.mousemove = (e:MouseEvent):void =>
		{
			this.mouseState.x = e.movementX;
			this.mouseState.y = e.movementY;
		};

		this.keypress = (e:KeyboardEvent):void =>
		{
			const key = this.key(e.code);
			key.down = true;
			key.pressed = true;
		};

		this.keyup = (e:KeyboardEvent):void =>
		{
			const key = this.key(e.code);
			key.down = false;
		};

		document.addEventListener("mousedown", this.mousedown);
		document.addEventListener("mouseup", this.mouseup);
		document.addEventListener("mousemove", this.mousemove);
		document.addEventListener("keypress", this.keypress);
		document.addEventListener("keyup", this.keyup);
	}

	/**
	 * Update pressed state for all inputs.
	 */
	public update():void
	{
		for(const key of this.keyStates.values())
			key.pressed = false;
		this.mouseState.pressed = false;
		this.mouseState.x = 0;
		this.mouseState.y = 0;
	}

	/**
	 * Clean up all input listeners.
	 */
	public destroy():void
	{
		document.removeEventListener("mousedown", this.mousedown);
		document.removeEventListener("mouseup", this.mouseup);
		document.removeEventListener("mousemove", this.mousemove);
		document.removeEventListener("keypress", this.keypress);
		document.removeEventListener("keyup", this.keyup);
	}

	/**
	 * Return the input state for a given key.
	 */
	public key(code:string):KeyState
	{
		let state = this.keyStates.get(code);

		if(!state)
		{
			state = {
				down: false,
				pressed: false
			};

			this.keyStates.set(code, state);
		}

		return state;
	}

	public mouse():MouseState
	{
		return this.mouseState;
	}
}
