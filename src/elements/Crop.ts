import * as THREE from "three";
import {VOXEL_DEPTH, VOXEL_HEIGHT, VOXEL_WIDTH} from "../core/globals";
import type Player from "../entities/Player";
import CROPS from "../../data/crops.json";


type CropType = typeof CROPS[keyof typeof CROPS] & {
	material:THREE.MeshStandardMaterial;
	material_harvested:THREE.MeshStandardMaterial;
};

export default class Crop
{
	public static readonly types:Record<string, CropType> = {};
	private static readonly geometry:THREE.BufferGeometry = new THREE.PlaneGeometry().translate(0, 1/2, 0).scale(1/2, 1, 1);

	public readonly x:number;
	public readonly y:number;
	public readonly z:number;
	public readonly mesh:THREE.Mesh;
	public readonly type:CropType;
	public harvested:boolean;

	public constructor(type:CropType, x:number, y:number, z:number)
	{
		this.type = type;

		this.x = x;
		this.y = y;
		this.z = z;
		this.mesh = new THREE.Mesh(Crop.geometry, this.type.material);
		this.mesh.position.set(x*VOXEL_WIDTH + VOXEL_WIDTH/2, y*VOXEL_HEIGHT, z*VOXEL_DEPTH + VOXEL_DEPTH/2);
		this.mesh.receiveShadow = true;

		this.harvested = false;
	}

	public update(player:Player):void
	{
		const diff = new THREE.Vector3().copy(player.position).sub(this.mesh.position);
		this.mesh.rotation.set(0, Math.atan2(diff.x, diff.z), 0);
	}

	public harvest():void
	{
		if(!this.harvested)
		{
			this.harvested = true;
			this.mesh.material = this.type.material_harvested;
		}
	}

	public static async initialize():Promise<void>
	{
		const loader = new THREE.TextureLoader();
		await Promise.all(Object.entries(CROPS).map(async ([key, type]):Promise<void> =>
		{
			const texture = await loader.loadAsync(`/assets/textures/${key}.png`);
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;

			const texture_harvested = await loader.loadAsync(`/assets/textures/${key}_harvested.png`);
			texture_harvested.minFilter = THREE.NearestFilter;
			texture_harvested.magFilter = THREE.NearestFilter;

			Crop.types[key] = {
				...type,
				material: new THREE.MeshStandardMaterial({map: texture, transparent: true}),
				material_harvested: new THREE.MeshStandardMaterial({map: texture_harvested, transparent: true})
			};
		}));
	}

	public static destroy():void
	{
		for(const {material, material_harvested} of Object.values(Crop.types))
		{
			material.map?.dispose();
			material_harvested.map?.dispose();
		}
	}
}
