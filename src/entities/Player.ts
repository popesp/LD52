import * as THREE from "three";
import Entity from "./Entity";
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
const position = new THREE.Vector3();

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
	 * Detect and resolve collision with the scene level.
	 */
	// private collision():void
	// {
	// 	position.copy(this.position).add(this.velocity);

	// 	Int32 startx = (Int32)(((Single)position.X) / Tile.SIZE) - 1;
	// 	Int32 endx = (Int32)(((Single)position.X + this.Width - 0.0001f) / Tile.SIZE) + 1; // because of float imprecision, we subtract 0.0001f.
	// 	Int32 starty = (Int32)(((Single)position.Y) / Tile.SIZE) - 1;
	// 	Int32 endy = (Int32)(((Single)position.Y + this.Height - 0.0001f) / Tile.SIZE) + 1; // because of float imprecision, we subtract 0.0001f.

	// 	// these variables are filled with only solid tiles
	// 	List<Point> horizontalWall = new List<Point>();
	// 	List<Point> verticalWall = new List<Point>();
	// 	Point ?corner = null;

	// 	if (this.IsMovingRight)
	// 	{
	// 		// we use starty + 1 to remove the corner
	// 		for (Int32 y = starty + 1; y < endy; y += 1)
	// 			if (realm.GetTile(endx, y).IsSolid)
	// 				verticalWall.Add(new Point(endx, y));
	// 	}
	// 	else if (this.IsMovingLeft)
	// 	{
	// 		// we use starty + 1 to remove the corner
	// 		for (Int32 y = starty + 1; y < endy; y += 1)
	// 			if (realm.GetTile(startx, y).IsSolid)
	// 				verticalWall.Add(new Point(startx, y));
	// 	}

	// 	if (this.IsMovingDown)
	// 	{
	// 		// we use startx + 1 to remove the corner
	// 		for (Int32 x = startx + 1; x < endx; x += 1)
	// 			if (realm.GetTile(x, endy).IsSolid)
	// 				horizontalWall.Add(new Point(x, endy));
	// 	}
	// 	else if (this.IsMovingUp)
	// 	{
	// 		// we use startx + 1 to remove the corner
	// 		for (Int32 x = startx + 1; x < endx; x += 1)
	// 			if (realm.GetTile(x, starty).IsSolid)
	// 				horizontalWall.Add(new Point(x, starty));
	// 	}

	// 	if (this.IsMovingLeft && this.IsMovingUp)
	// 	{
	// 		if (realm.GetTile(startx, starty).IsSolid)
	// 			corner = new Point(startx, starty);
	// 	}
	// 	else if (this.IsMovingRight && this.IsMovingUp)
	// 	{
	// 		if (realm.GetTile(endx, starty).IsSolid)
	// 			corner = new Point(endx, starty);
	// 	}
	// 	else if (this.IsMovingLeft && this.IsMovingDown)
	// 	{
	// 		if (realm.GetTile(startx, endy).IsSolid)
	// 			corner = new Point(startx, endy);
	// 	}
	// 	else if (this.IsMovingRight && this.IsMovingDown)
	// 	{
	// 		if (realm.GetTile(endx, endy).IsSolid)
	// 			corner = new Point(endx, endy);
	// 	}

	// 	foreach (Point point in verticalWall)
	// 	{
	// 		// if our next position would collide with the tile, we fix velocity.
	// 		if (nextPosition.X + this.Width > point.X * Tile.SIZE &&
	// 			nextPosition.X < point.X * Tile.SIZE + Tile.SIZE)
	// 		{
	// 			if (this.IsMovingRight)
	// 			{
	// 				velocity.X = point.X * Tile.SIZE - (position.X + this.Width);
	// 			}
	// 			else if (this.IsMovingLeft)
	// 			{
	// 				velocity.X = (point.X * Tile.SIZE + Tile.SIZE) - position.X;
	// 			}
	// 		}
	// 	}

	// 	foreach (Point point in horizontalWall)
	// 	{
	// 		// if our next position would collide with the tile, we fix velocity.
	// 		if (nextPosition.Y + this.Height > point.Y * Tile.SIZE &&
	// 			nextPosition.Y < point.Y * Tile.SIZE + Tile.SIZE)
	// 		{
	// 			if (this.IsMovingDown)
	// 			{
	// 				velocity.Y = point.Y * Tile.SIZE - (position.Y + this.Height);
	// 			}
	// 			else if (this.IsMovingUp)
	// 			{
	// 				velocity.Y = (point.Y * Tile.SIZE + Tile.SIZE) - position.Y;
	// 			}
	// 		}
	// 	}

	// 	// in case we only have a corner to consider, we rule that we land on top of it, or hit the bottom of it.
	// 	if (corner.HasValue && verticalWall.Count == 0 && horizontalWall.Count == 0)
	// 	{
	// 		// if our next position would collide with the tile, we fix velocity.
	// 		if (nextPosition.Y + this.Height > corner.Value.Y * Tile.SIZE &&
	// 			nextPosition.Y < corner.Value.Y * Tile.SIZE + Tile.SIZE &&
	// 			nextPosition.X + this.Width > corner.Value.X * Tile.SIZE &&
	// 			nextPosition.X < corner.Value.X * Tile.SIZE + Tile.SIZE)
	// 		{
	// 			if (this.IsMovingDown)
	// 			{
	// 				velocity.Y = corner.Value.Y * Tile.SIZE - (position.Y + this.Height);
	// 			}
	// 			else if (this.IsMovingUp)
	// 			{
	// 				velocity.Y = (corner.Value.Y * Tile.SIZE + Tile.SIZE) - position.Y;
	// 			}
	// 		}
	// 	}
	// }

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
