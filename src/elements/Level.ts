import * as THREE from "three";
import Crop from "./Crop";
import type LEVELS from "../../data/levels.json";


const VOXEL_WIDTH = 1.0;
const VOXEL_HEIGHT = 1.0;
const VOXEL_DEPTH = 1.0;

const MATERIAL_DIRT = new THREE.MeshStandardMaterial({color: 0xa08060});
const MATERIAL_GRASS = new THREE.MeshStandardMaterial({color: 0x60a080});
const MATERIALS = [MATERIAL_DIRT, MATERIAL_GRASS];


interface Voxel
{
	id:number;
}

type LevelConfig = typeof LEVELS[number];

export default class Level
{
	private static readonly geometry_voxel = new THREE.BoxGeometry(VOXEL_WIDTH, VOXEL_HEIGHT, VOXEL_HEIGHT).translate(VOXEL_WIDTH/2, VOXEL_HEIGHT/2, VOXEL_DEPTH/2);

	public readonly meshes:THREE.Group;
	public readonly voxels:(Voxel|null)[][][];
	public readonly crops:Crop[];

	private readonly width:number;
	private readonly height:number;
	private readonly depth:number;

	public constructor(config:LevelConfig)
	{
		this.width = config.voxels[0][0].length;
		this.height = config.voxels[0].length;
		this.depth = config.voxels.length;

		this.voxels = config.voxels.map((xy):(Voxel|null)[][] => xy.map((x):(Voxel|null)[] => x.map((id):Voxel|null => id ? {id} : null)));

		this.meshes = new THREE.Group();
		this.voxels.forEach((slice, z):void =>
		{
			slice.forEach((row, y):void =>
			{
				row.forEach((voxel, x):void =>
				{
					if(voxel)
					{
						const mesh = new THREE.Mesh(Level.geometry_voxel, MATERIALS[voxel.id - 1]);
						mesh.position.set(x*VOXEL_WIDTH, y*VOXEL_HEIGHT, z*VOXEL_DEPTH);
						mesh.receiveShadow = true;

						this.meshes.add(mesh);
					}
				});
			});
		});

		this.crops = config.crops.map((cropConfig):Crop => new Crop(cropConfig.type));
	}

	public voxelAt({x, y, z}:THREE.Vector3):Voxel|null
	{
		return this.voxels[Math.floor(z/VOXEL_DEPTH)][Math.floor(y/VOXEL_HEIGHT)][Math.floor(x/VOXEL_WIDTH)];
	}
}
