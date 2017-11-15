import Cube from './cube.js';
import {SphereGeometry, BoxGeometry, LatheBufferGeometry, Vector2} from 'three';

export default class CollectionGeometries{
    constructor(){
        let lathePoints = [];
        for ( var i = 0; i < 10; i ++ ) {
	          lathePoints.push( new Vector2( Math.sin( i * 0.2 ) * 5 + 5, ( i - 5 ) * 2 ) );
        }

        let widthSegments = 32;
        let heightSegments = 32;
        let radius = 5;
        let geometries = {
            "sphere": new SphereGeometry(radius, widthSegments, heightSegments),
            "box": new BoxGeometry( radius, radius, radius, 4, 4, 4 ),
            "lathe": new LatheBufferGeometry( lathePoints )
        };
        return geometries;
    }
}


