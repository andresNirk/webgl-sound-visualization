
import * as THREE from "three";
import WSVMath from "src/util/WSVMath";
import CollectionGeometries from "../geometries.js";
import CollectionMaterials from "../materials.js";

const materials = new CollectionMaterials();
const geometries = new CollectionGeometries();

const nrOfBars = 128;

export default class BarsViz {
    static TYPE = "bars";
    static NAME = "Bars";

    constructor(fftSize) {
        this.fftSize = fftSize;
        this.name = BarsViz.NAME;
        this.type = BarsViz.TYPE;
    }


    onRender = (fftValuesDb, fftValuesNormalized) => {
        this.updateBars(fftValuesDb, fftValuesNormalized);
    }

    onFftChanged = (logarithmic) => {
        this.rebuildFftIndex(logarithmic);
    }

    onAdd = (scene) => {
        this.setBars(nrOfBars, scene);
        this.rebuildFftIndex();
    }

    onRemove = (scene) => {
		if(scene!=null){
			this.barsGeometry.forEach(bar => {
				scene.remove(bar);
			});
		}
    }

    updateBars = (fftValues, fftValuesNormalized) => {
        this.barsGeometry.forEach((bar, i) => {
            // bar.scale.set(1, Math.min(1, -(fftValues[this.fftIndexes[i]] + 140) * 2), 1);
            bar.scale.set(1, Math.max(1, 200 * fftValuesNormalized[this.fftIndexes[i]]), 1);
        });
    }

    setBars(nr, scene) {
        this.onRemove();
        this.bars = nr;
        this.barsGeometry = [];
        this.fftIndexes = [];
        const hw = nr / 2;
        for (let i = 0; i < nr; i += 1) {
            const bar = new THREE.Mesh(geometries.box, materials.phong);
            bar.position.set((i - hw) * 3, 0, 0);
            this.barsGeometry.push(bar);
            scene.add(bar);
        }
    }

    rebuildFftIndex = (logarithmic = true) => {
        const indexes = [];
        for (let i = 0; i < this.bars; i += 1) {
            const logi = Math.round(WSVMath.lin2log(i + 1, 1, this.bars, 1, this.fftSize));
            if (i + 1 <= logi && logarithmic) {
                indexes.push(logi);
            } else {
                indexes.push(i + 1);
            }
        }
        this.fftIndexes = indexes;
    }

    bars = 0;
    barsGeometry = [];
    fftIndexes = [];
    fftSize = null;
    scene = null;
}

