import * as THREE from "three";
import GameOverScene from "./GameOverScene";
import Scene from "./Scene";
import type Game from "../core/game";
import {FOV, FRUSTUM_FAR, FRUSTUM_NEAR, HEIGHT_CANVAS, WIDTH_CANVAS} from "../core/globals";
import Crop from "../elements/Crop";
import Level from "../elements/Level";
import Scythe from "../elements/Scythe";
import type Entity from "../entities/Entity";
import Player from "../entities/Player";
import LEVELS from "../../data/levels.json";


const X_SPAWN = 8;
const Y_SPAWN = 2;
const Z_SPAWN = 4;

const LIGHT_COLOR_AMBIENT = 0x606060;
const LIGHT_COLOR_SUNLIGHT = 0xffffff;
const LIGHT_INTENSITY_SUNLIGHT = 0.5;
const LIGHT_X_SUNLIGHT = 20;
const LIGHT_Y_SUNLIGHT = 10;
const LIGHT_Z_SUNLIGHT = 10;

const SCYTHE_OFFSET_X = 0.5;
const SCYTHE_OFFSET_Y = -0.3;
const SCYTHE_OFFSET_Z = -0.5;
const SCYTHE_ROTATION_X = -0.3;
const SCYTHE_ROTATION_Y = Math.PI;
const SCYTHE_ROTATION_Z = -0.3;


export default class HarvestScene extends Scene
{
	public readonly camera:THREE.PerspectiveCamera;
	public level:Level|null;

	private readonly scene_level:THREE.Scene;
	private readonly scene_camera:THREE.Scene;
	private readonly player:Player;
	private readonly entities:Entity<HarvestScene>[];
	private paused:boolean;

	public constructor(game:Game)
	{
		super(game);

		this.scene_level = new THREE.Scene();
		this.scene_camera = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, FRUSTUM_NEAR, FRUSTUM_FAR);
		this.player = new Player(this, game.input, X_SPAWN, Y_SPAWN, Z_SPAWN);
		this.level = null;

		this.entities = [this.player];

		this.paused = false;

		const sunlight = new THREE.DirectionalLight(LIGHT_COLOR_SUNLIGHT, LIGHT_INTENSITY_SUNLIGHT);
		sunlight.position.set(LIGHT_X_SUNLIGHT, LIGHT_Y_SUNLIGHT, LIGHT_Z_SUNLIGHT);
		sunlight.castShadow = true;
		const lights = [sunlight, new THREE.AmbientLight(LIGHT_COLOR_AMBIENT)];
		const lights2 = [new THREE.AmbientLight(LIGHT_COLOR_AMBIENT)];

		this.scene_level.add(...lights);
		this.scene_camera.add(this.camera, ...lights2);
	}

	public override async initialize():Promise<void>
	{
		await Promise.all([
			Scythe.initialize(),
			Crop.initialize()
		]);
	}

	public override start():void
	{
		document.body.requestPointerLock();

		const scythe = new Scythe(this, new THREE.Vector3(0, 0, 0));
		scythe.mesh.position.set(SCYTHE_OFFSET_X, SCYTHE_OFFSET_Y, SCYTHE_OFFSET_Z);
		scythe.mesh.rotation.set(SCYTHE_ROTATION_X, SCYTHE_ROTATION_Y, SCYTHE_ROTATION_Z, "XZY");

		this.camera.add(scythe.mesh);

		this.level = new Level(LEVELS[0]);

		this.scene_level.add(this.level.meshes, ...this.level.crops.map((crop):THREE.Mesh => crop.mesh));
	}

	public override update(dt:number):void
	{
		if(this.game.input.key("KeyP").pressed)
			this.paused = !this.paused;

		if(this.paused)
			return;

		if(this.level)
			for(const crop of this.level.crops)
				crop.update(this.player);

		const dummy = new THREE.Object3D();
		dummy.rotation.order = "YXZ";

		// reset all unique mesh counts
		for(const mesh of Array.from(new Set(this.entities.map((entity):THREE.InstancedMesh|null => entity.mesh))))
			if(mesh)
				mesh.count = 0;

		for(const entity of this.entities)
			if(entity.alive)
			{
				entity.update(dt);

				if(entity.mesh)
				{
					dummy.position.copy(entity.position);
					dummy.rotation.copy(entity.rotation);
					dummy.updateMatrix();

					const index = entity.mesh.count++;
					entity.mesh.setMatrixAt(index, dummy.matrix);
					entity.mesh.setColorAt(index, entity.color);

					entity.mesh.instanceMatrix.needsUpdate = true;
					if(entity.mesh.instanceColor)
						entity.mesh.instanceColor.needsUpdate = true;
				}
			}

		if(!this.player.alive)
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			this.game.switchScene(new GameOverScene(this.game));

		this.game.renderer.clear();
		this.game.renderer.render(this.scene_level, this.camera);
		this.game.renderer.render(this.scene_camera, this.camera);
	}

	public override destroy():void
	{
		this.scene_level.clear();
	}
}
