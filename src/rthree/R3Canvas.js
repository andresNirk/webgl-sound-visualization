import React, { Component } from "react";
import React3 from "react-three-renderer";

export default class R3Canvas extends Component {
    render() {
        const { width, height } = this.props;
        return (
            <React3
                mainCamera="camera" // this points to the perspectiveCamera below
                width={width}
                height={height}
            >
                <scene>
                    <perspectiveCamera
                        name="camera"
                        fov={75}
                        aspect={width / height}
                        near={0.1}
                        far={1000}
                        position={this.cameraPosition}
                    />
                    <mesh
                        rotation={this.state.cubeRotation}
                    >
                        <boxGeometry
                            width={1}
                            height={1}
                            depth={1}
                        />
                        <meshBasicMaterial
                            color={0x00ff00}
                        />
                    </mesh>
                </scene>
            </React3>
        );
    }
}
