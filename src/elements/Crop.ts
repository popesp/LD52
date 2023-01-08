import * as THREE from "three";
import CROPS from "../../data/crops.json";


type CropType = typeof CROPS[keyof typeof CROPS] & {
	mesh:THREE.InstancedMesh;
};

export default class Crop
{
	public static readonly types:Record<string, CropType> = {};
	private static readonly geometry:THREE.BufferGeometry = new THREE.PlaneGeometry();

	private readonly type:string;

	public constructor(type:string)
	{
		this.type = type;
	}

	public static async initialize(max:number):Promise<void>
	{
		const loader = new THREE.TextureLoader();
		await Promise.all(Object.entries(CROPS).map(async ([key, type]):Promise<void> =>
		{
			const texture = await loader.loadAsync(`/assets/textures/${key}.png`);
			const mesh = new THREE.InstancedMesh(Crop.geometry, new THREE.MeshBasicMaterial({map: texture}), max);
			mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
			mesh.castShadow = true;

			Crop.types[key] = {...type, mesh};
		}));
	}

	public static destroy():void
	{
		for(const {mesh} of Object.values(Crop.types))
			mesh.dispose();
	}
}
