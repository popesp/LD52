
import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import type HarvestScene from "../scenes/HarvestScene";


export default class Scythe
{
	public static geometry:THREE.BufferGeometry;

	public readonly mesh:THREE.Mesh;

	private readonly scene:HarvestScene;

	public constructor(scene:HarvestScene, position:THREE.Vector3)
	{
		this.scene = scene;

		this.mesh = new THREE.Mesh(Scythe.geometry, new THREE.MeshStandardMaterial({color: 0x808080, roughness: 0.5, depthTest: false}));
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;

		console.log(Scythe.geometry);
	}

	public static async initialize():Promise<void>
	{
		const group = await new OBJLoader().loadAsync("../../assets/obj/handscythe.obj");

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		Scythe.geometry = (group.children[0] as THREE.Mesh).geometry;

		console.log(Scythe.geometry);
	}
}
