import * as THREE from "three";
import {WIDTH_CANVAS, HEIGHT_CANVAS} from "./globals";
import type Scene from "./scenes/Scene";


const SECONDS_PER_MS = 0.001;
const DT_MIN = 0.033333333333;


export default class Game
{
	private readonly renderer:THREE.WebGLRenderer;
	private scene_active:Scene|null;

	/**
	 * Create a new game instance.
	 */
	public constructor()
	{
		this.renderer = new THREE.WebGLRenderer({antialias: false});
		document.body.appendChild(this.renderer.domElement);
		window.addEventListener("resize", ():void => this.resize());
		this.resize();

		this.scene_active = null;
		let t_last:number|null = null;

		const step = (t:number):void =>
		{
			t_last ??= t;

			const dt = Math.min(DT_MIN, SECONDS_PER_MS*(t - t_last));
			this.scene_active?.update(dt);

			t_last = t;
			requestAnimationFrame(step);
		};

		/** @type {number} */
		requestAnimationFrame(step);
	}

	/**
	 * Resize the game to fit in the window.
	*/
	private resize():void
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		const r = HEIGHT_CANVAS/WIDTH_CANVAS;

		if(w*r > window.innerHeight)
			w = Math.min(w, Math.ceil(h/r), WIDTH_CANVAS);
		h = Math.floor(w*r);

		this.renderer.domElement.style.top = `${Math.floor((window.innerHeight - h)/2)}px`;
		this.renderer.domElement.style.left = `${Math.floor((window.innerWidth - w)/2)}px`;
		this.renderer.setSize(w, h);
	}

	/**
	 * Switch the currently active scene.
	 */
	public async switchScene(scene:Scene):Promise<void>
	{
		this.scene_active?.destroy();
		this.scene_active = null;

		await scene.initialize().then(():void =>
		{
			scene.start();
			this.scene_active = scene;
		});
	}
}
