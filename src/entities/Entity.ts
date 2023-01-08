import * as THREE from "three";
import type Scene from "../scenes/Scene";


export default abstract class Entity<T extends Scene>
{
	public readonly mesh:THREE.InstancedMesh|null;
	public readonly position:THREE.Vector3;
	public readonly rotation:THREE.Euler;
	public readonly color:THREE.Color;
	public alive:boolean;

	protected readonly scene:T;
	protected readonly velocity:THREE.Vector3;

	private readonly type:string;

	/**
	 * Create a new entity.
	 */
	public constructor(scene:T, type:string, position:THREE.Vector3, mesh:THREE.InstancedMesh|null = null)
	{
		this.scene = scene;
		this.type = type;
		this.mesh = mesh;
		this.position = new THREE.Vector3().copy(position);

		this.rotation = new THREE.Euler(0, 0, 0, "YXZ");
		this.velocity = new THREE.Vector3();
		this.color = new THREE.Color();
		this.alive = true;
	}

	/**
	 * Update entity for this timestep.
	 */
	public update(dt:number):void
	{
		this.position.addScaledVector(this.velocity, dt);
	}

	public abstract destroy():void;
}
