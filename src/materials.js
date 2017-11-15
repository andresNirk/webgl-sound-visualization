import {MeshStandardMaterial,MeshBasicMaterial,MeshPhongMaterial,MeshLambertMaterial } from 'three';

export default class CollectionMaterials {
    constructor(){
        let materials = {
            "standard": new MeshStandardMaterial( {color: 0x00ff00} ),
            "wireframe": new MeshBasicMaterial( {color: 0x00ff00, wireframe: true} ),
            "phong": new MeshPhongMaterial({color: 0x2194CE}),
            "lambert": new MeshLambertMaterial({color: 0x2194CE})
        };
        return materials;
    }
}
