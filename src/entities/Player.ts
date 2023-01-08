import * as THREE from "three";
import Entity from "./Entity";
import {VOXEL_DEPTH, VOXEL_HEIGHT, VOXEL_WIDTH} from "../core/globals";
import type InputManager from "../core/input";
import type HarvestScene from "../scenes/HarvestScene";


const MOUSESPEED = 0.003;
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

const HEIGHT = 1.5;
// const WIDTH = 1;

// maximum speed in m/s
const SPEED = 20;

// number of seconds to reach top speed
const ACCTIME = 0.2;

// number of seconds to reach 0 speed
const DECTIME = 0.1;

// initial jump speed in m/s
const PLAYER_JUMP = 8;

// downward speed (in m/s) gained each second
const GRAVITY = 12;

const Y_DEATHPLANE = -25;

const pitch = new THREE.Quaternion();
const yaw = new THREE.Quaternion();
const direction = new THREE.Vector3();

export default class Player extends Entity<HarvestScene>
{
	private readonly input:InputManager;
	private readonly facing:THREE.Vector3;
	private readonly angles:THREE.Euler;
	private mouselock:boolean;
	private canjump:boolean;
	private lasty:number;

	/**
	 * Create a new player.
	 */
	public constructor(scene:HarvestScene, input:InputManager, x_spawn = 0, y_spawn = 0, z_spawn = 0)
	{
		super(scene, "player", new THREE.Vector3(x_spawn, y_spawn, z_spawn));

		this.input = input;
		this.facing = new THREE.Vector3();
		this.angles = new THREE.Euler();
		this.mouselock = false;
		this.canjump = false;
		this.lasty = this.position.y;

		document.addEventListener("pointerlockchange", ():void =>
		{
			this.mouselock = Boolean(document.pointerLockElement);
		});
	}

	/**
	 * Update the player for this timestep.
	 */
	public override update(dt:number):void
	{
		const mouse = this.input.mouse();

		// mouse events
		if(this.mouselock)
		{
			this.angles.y -= mouse.x*MOUSESPEED;
			this.angles.x -= mouse.y*MOUSESPEED;

			this.angles.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.angles.x));

			pitch.setFromAxisAngle(AXIS_X, this.angles.x);
			yaw.setFromAxisAngle(AXIS_Y, this.angles.y);

			this.scene.camera.quaternion.multiplyQuaternions(yaw, pitch).normalize();
		}
		else if(mouse.pressed)
			document.body.requestPointerLock();

		const forward = (this.input.key("KeyS").down ? 1 : 0) - (this.input.key("KeyW").down ? 1 : 0);
		const right = (this.input.key("KeyD").down ? 1 : 0) - (this.input.key("KeyA").down ? 1 : 0);
		direction.set(right, 0, forward).normalize();
		direction.applyQuaternion(yaw);

		if(this.input.key("Space").pressed && this.canjump)
			this.velocity.y += PLAYER_JUMP;

		const yspeed = this.velocity.y;
		this.velocity.y = 0;

		this.velocity.addScaledVector(direction, dt*SPEED/ACCTIME);
		this.velocity.addScaledVector(this.velocity, -dt/DECTIME);
		this.velocity.clampLength(0, SPEED);
		this.velocity.y = yspeed - dt*GRAVITY;


		// this.collision();

		this.lasty = this.position.y;
		super.update(dt);

		const voxelX = Math.floor(this.position.x/VOXEL_WIDTH);
		const voxelY = Math.floor(this.position.y/VOXEL_HEIGHT);
		const voxelZ = Math.floor(this.position.z/VOXEL_DEPTH);

		if(this.scene.level)
			for(const crop of this.scene.level.crops)
				if(crop.x === voxelX && crop.y === voxelY && crop.z === voxelZ)
					crop.harvest();

		const {y} = this.position;
		if(y < HEIGHT/2)
		{
			if(this.lasty >= HEIGHT/2)
			{
				this.position.y = HEIGHT/2;
				this.velocity.y = 0;
				this.canjump = true;
			}
		}
		else
			this.canjump = false;

		if(y < Y_DEATHPLANE)
			this.alive = false;

		this.scene.camera.position.x = this.position.x;
		this.scene.camera.position.y = this.position.y + HEIGHT/2;
		this.scene.camera.position.z = this.position.z;

		this.scene.camera.getWorldDirection(this.facing);
	}

	/**
	 * Destroy the player.
	 */
	public override destroy():void
	{
	}
}
