import * as THREE from "three";
import {VOXEL_DEPTH, VOXEL_HEIGHT, VOXEL_WIDTH} from "../core/globals";
import CROPS from "../../data/crops.json";


const PIXELS_HEIGHT_TEXTURE = 44;
const PIXELS_SUBMERGED = 5;


type CropType = typeof CROPS[keyof typeof CROPS] & {
	material:THREE.MeshBasicMaterial;
	material_harvested:THREE.MeshBasicMaterial;
};

export default class Crop
{
	public static readonly types:Record<string, CropType> = {};
	private static readonly geometry:THREE.BufferGeometry = new THREE.PlaneGeometry().translate(0, 1/2 - PIXELS_SUBMERGED/PIXELS_HEIGHT_TEXTURE, 0).scale(1/2, 1, 1);

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

		this.harvested = false;
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
				material: new THREE.MeshBasicMaterial({map: texture, transparent: true}),
				material_harvested: new THREE.MeshBasicMaterial({map: texture_harvested, transparent: true})
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
