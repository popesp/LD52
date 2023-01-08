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

const LIGHT_SPACING = 20;
const LIGHT_Y = 20;
const LIGHT_COLOR = 0xffffff;
const LIGHT_COLOR_AMBIENT = 0x303030;
const LIGHT_INTENSITY = 0.5;
const LIGHT_DISTANCE = 80;
const LIGHT_POSITIONS = [
	[-LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING],
	[LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING],
	[-LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING],
	[LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING]
];

const MAX_CROPS = 100;


export default class HarvestScene extends Scene
{
	public readonly camera:THREE.PerspectiveCamera;

	private readonly threeScene:THREE.Scene;
	private readonly player:Player;
	private readonly level:Level;
	private readonly entities:Entity<HarvestScene>[];
	private paused:boolean;

	public constructor(game:Game)
	{
		super(game);

		this.threeScene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, FRUSTUM_NEAR, FRUSTUM_FAR);
		this.player = new Player(this, game.input, X_SPAWN, Y_SPAWN, Z_SPAWN);
		this.level = new Level(LEVELS[0]);

		this.entities = [this.player];

		this.paused = false;

		const lights = [...LIGHT_POSITIONS.map(([x, y, z]):THREE.PointLight =>
		{
			const light = new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE);
			light.position.set(x, y, z);
			light.castShadow = true;

			return light;
		}), new THREE.AmbientLight(LIGHT_COLOR_AMBIENT)];

		this.threeScene.add(this.camera, this.level.meshes, ...lights);
	}

	public override async initialize():Promise<void>
	{
		return Promise.all([
			Scythe.initialize(),
			Crop.initialize(MAX_CROPS)
		]).then(():void =>
		{
			for(const {mesh} of Object.values(Crop.types))
			{
				mesh.count = 0;
				this.threeScene.add(mesh);
			}
		});
	}

	public override start():void
	{
		document.body.requestPointerLock();

		const scythe = new Scythe(this, new THREE.Vector3(0, 0, 0));
		scythe.mesh.position.set(0.5, -0.3, -0.5);
		scythe.mesh.rotation.set(-0.3, Math.PI, -0.3, "XZY");

		this.camera.add(scythe.mesh);
	}

	public override update(dt:number):void
	{
		if(this.game.input.key("KeyP").pressed)
			this.paused = !this.paused;

		if(this.paused)
			return;

		const dummy = new THREE.Object3D();
		dummy.rotation.order = "YXZ";

		// reset all unique mesh counts
		for(const mesh of Array.from(new Set(this.entities.map((entity):THREE.InstancedMesh|null => entity.mesh))))
			if(mesh)
				mesh.count = 0;

		for(const crop of this.level.crops)
		{
			
		}

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
			this.game.switchScene(new GameOverScene(this.game));

		this.game.renderer.render(this.threeScene, this.camera);
	}

	public override destroy():void
	{
		this.threeScene.clear();
	}
}