/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 .\public\low_poly_room_2.glb --output src/model-components/LowPolyRoom3.tsx --types 
*/

import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Group, Object3DEventMap } from "three";

type ActionName = "Animation";

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    Chair: THREE.Mesh;
    Draw2: THREE.Mesh;
    Draw1: THREE.Mesh;
    Draw3: THREE.Mesh;
    Bed: THREE.Mesh;
    Bin: THREE.Mesh;
    Object_34001: THREE.Mesh;
    Object_34001_1: THREE.Mesh;
    Object_34001_2: THREE.Mesh;
    Object_9001: THREE.Mesh;
    Object_9001_1: THREE.Mesh;
    Rug: THREE.Mesh;
    Monitor: THREE.Mesh;
    MonitorScreen: THREE.Mesh;
    Object_14001: THREE.Mesh;
    Object_14001_1: THREE.Mesh;
    Mouse: THREE.Mesh;
    Object_47001: THREE.Mesh;
    Object_47001_1: THREE.Mesh;
    Object_47001_2: THREE.Mesh;
    Heater: THREE.Mesh;
    Floor: THREE.Mesh;
    Glass: THREE.Mesh;
    Wall: THREE.Mesh;
    Books: THREE.Mesh;
    Printer: THREE.Mesh;
    PotPlant: THREE.Mesh;
    Bookshelf: THREE.Mesh;
    mesh_25003: THREE.Mesh;
    mesh_25003_1: THREE.Mesh;
    Object_44001: THREE.Mesh;
    Object_44001_1: THREE.Mesh;
    Object_44001_2: THREE.Mesh;
    Mug: THREE.Mesh;
    Desk: THREE.Mesh;
    TissueBox: THREE.Mesh;
    Billboard: THREE.Mesh;
    Blinds: THREE.Mesh;
  };
  materials: {
    ["LowPoly.001"]: THREE.MeshStandardMaterial;
    ["GlowB.001"]: THREE.MeshStandardMaterial;
    ["Rainbow.001"]: THREE.MeshStandardMaterial;
    ["GlowY.001"]: THREE.MeshStandardMaterial;
    ["Screen.001"]: THREE.MeshStandardMaterial;
    ["material.001"]: THREE.MeshStandardMaterial;
    ["Glass.001"]: THREE.MeshPhysicalMaterial;
    ["Floor.001"]: THREE.MeshStandardMaterial;
    ["GlowG.001"]: THREE.MeshStandardMaterial;
    ["GlowR.001"]: THREE.MeshStandardMaterial;
    ["trees.001"]: THREE.MeshPhysicalMaterial;
  };
  animations: GLTFAction[];
};

export function LowPolyRoom(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<Group<Object3DEventMap>>(null);

  const { nodes, materials, animations } = useGLTF(
    "/low_poly_room_2.glb"
  ) as GLTFResult;
  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group
                name="Chair_23"
                position={[-0.896, 0.397, 0.815]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Chair"
                  geometry={nodes.Chair.geometry}
                  material={materials["LowPoly.001"]}
                  position={[0, -0.214, 0]}
                />
              </group>

              <group
                name="Cube011_5"
                position={[-0.896, 0.397, 0.815]}
                rotation={[0, 0.052, 0]}
              />
              <group name="Shelves002_39" position={[-1.704, 0.833, -1.42]} />
              <group
                name="Bed_24"
                position={[-0.424, 0.536, -1.826]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Bed"
                  geometry={nodes.Bed.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group
                name="Bin_4"
                position={[-1.642, 0.64, 0.144]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Bin"
                  geometry={nodes.Bin.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group name="Cuppord_3" position={[-1.645, 0.541, 1.454]} />
              <group
                name="Keyboard_33"
                position={[-1.447, 0.929, 0.727]}
                userData={{ selectable: true }}
              >
                <group name="Keys001_32" position={[-0.054, 0.009, 0.281]} />
                <group name="Keys_30" position={[-0.024, 0.009, 0.281]} />
                <group name="keys_31" position={[-0.007, 0.008, -0.066]} />
                <group name="Keyboard">
                  <mesh
                    name="Object_34001"
                    geometry={nodes.Object_34001.geometry}
                    material={materials["GlowB.001"]}
                  />
                  <mesh
                    name="Object_34001_1"
                    geometry={nodes.Object_34001_1.geometry}
                    material={materials["LowPoly.001"]}
                  />
                  <mesh
                    name="Object_34001_2"
                    geometry={nodes.Object_34001_2.geometry}
                    material={materials["Rainbow.001"]}
                  />
                </group>
              </group>
              <group
                name="Lamp_8"
                position={[-1.645, 0.909, 1.741]}
                rotation={[0, -1.439, 0]}
                userData={{ selectable: true }}
              >
                <group
                  name="Cube012_7"
                  position={[0, 0.242, 0]}
                  rotation={[-0.769, 0.097, -0.025]}
                >
                  <group
                    name="Cube014_6"
                    position={[0, 0.284, 0]}
                    rotation={[-1.665, -0.031, -0.133]}
                  >
                    <group name="Lamp">
                      <mesh
                        name="Object_9001"
                        geometry={nodes.Object_9001.geometry}
                        material={materials["GlowY.001"]}
                      />
                      <mesh
                        name="Object_9001_1"
                        geometry={nodes.Object_9001_1.geometry}
                        material={materials["LowPoly.001"]}
                      />
                    </group>
                  </group>
                </group>
              </group>
              <group name="LampHolder_9" position={[-1.645, 0.968, 1.747]} />
              <group
                name="Mat_25"
                position={[-1.347, 1.173, 0.409]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Rug"
                  geometry={nodes.Rug.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group
                name="Monitor_10"
                position={[-1.77, 1.106, 0.769]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Monitor"
                  geometry={nodes.Monitor.geometry}
                  material={materials["LowPoly.001"]}
                />
                <mesh
                  name="MonitorScreen"
                  geometry={nodes.MonitorScreen.geometry}
                  material={materials["Screen.001"]}
                />
                <group name="Webcam">
                  <mesh
                    name="Object_14001"
                    geometry={nodes.Object_14001.geometry}
                    material={materials["material.001"]}
                  />
                  <mesh
                    name="Object_14001_1"
                    geometry={nodes.Object_14001_1.geometry}
                    material={materials["GlowB.001"]}
                  />
                </group>
              </group>
              <group
                name="Mouse_21"
                position={[-1.642, 0.64, 0.144]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Mouse"
                  geometry={nodes.Mouse.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group
                name="COMPUTER"
                position={[-1.604, 0.484, 0.161]}
                userData={{ selectable: true }}
              >
                <group name="PC">
                  <mesh
                    name="Object_47001"
                    geometry={nodes.Object_47001.geometry}
                    material={materials["LowPoly.001"]}
                  />
                  <mesh
                    name="Object_47001_1"
                    geometry={nodes.Object_47001_1.geometry}
                    material={materials["GlowB.001"]}
                  />
                  <mesh
                    name="Object_47001_2"
                    geometry={nodes.Object_47001_2.geometry}
                    material={materials["Glass.001"]}
                  />
                </group>
              </group>
              <group
                name="Radiator_35"
                position={[-1.347, 1.173, 0.409]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Heater"
                  geometry={nodes.Heater.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group name="Room_34" position={[-1.347, 1.173, 0.409]}>
                <mesh
                  name="Floor"
                  geometry={nodes.Floor.geometry}
                  material={materials["Floor.001"]}
                />
                <mesh
                  name="Glass"
                  geometry={nodes.Glass.geometry}
                  material={materials["Glass.001"]}
                />
                <mesh
                  name="Wall"
                  geometry={nodes.Wall.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group name="Shelves001_40" position={[-1.704, 0.898, -1.228]} />
              <group
                name="Shelves_20"
                position={[-1.712, 1.238, -1.537]}
                userData={{ selectable: true }}
              >
                <group
                  name="Book001_16"
                  position={[0.003, 0.706, -0.513]}
                  userData={{ selectable: true }}
                >
                  <mesh
                    name="Books"
                    geometry={nodes.Books.geometry}
                    material={materials["LowPoly.001"]}
                  />
                </group>
                <group name="Book002_13" position={[0.033, 0.658, -0.636]} />
                <group name="Book003_14" position={[-0.015, 0.07, -0.301]} />
                <group name="Book004_15" position={[0.033, 0.16, -0.636]} />
                <group name="Book_17" position={[0.033, -0.338, -0.636]} />
                <group
                  name="Printer_18"
                  position={[0.008, -0.366, 0.109]}
                  userData={{ selectable: true }}
                >
                  <mesh
                    name="Printer"
                    geometry={nodes.Printer.geometry}
                    material={materials["LowPoly.001"]}
                  />
                </group>
                <group
                  name="Shelves003_19"
                  position={[0.008, 0.15, 0.36]}
                  userData={{ selectable: true }}
                >
                  <mesh
                    name="PotPlant"
                    geometry={nodes.PotPlant.geometry}
                    material={materials["LowPoly.001"]}
                  />
                </group>
                <mesh
                  name="Bookshelf"
                  geometry={nodes.Bookshelf.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
              <group
                name="Speaker001_27"
                position={[-1.712, 1.108, 0.24]}
                rotation={[0, -Math.PI / 6, 0]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="mesh_25003"
                  geometry={nodes.mesh_25003.geometry}
                  material={materials["GlowB.001"]}
                  morphTargetDictionary={nodes.mesh_25003.morphTargetDictionary}
                  morphTargetInfluences={nodes.mesh_25003.morphTargetInfluences}
                />

                <mesh
                  name="mesh_25003_1"
                  geometry={nodes.mesh_25003_1.geometry}
                  material={materials["LowPoly.001"]}
                  morphTargetDictionary={
                    nodes.mesh_25003_1.morphTargetDictionary
                  }
                  morphTargetInfluences={
                    nodes.mesh_25003_1.morphTargetInfluences
                  }
                />
              </group>
              <group
                name="Speaker002_36"
                position={[-1.712, 1.108, 1.333]}
                rotation={[0, Math.PI / 6, 0]}
                userData={{ selectable: true }}
              />
              <group name="Tabel001_37" position={[-1.95, 0.169, 0.769]}>
                <group name="Powerboard">
                  <mesh
                    name="Object_44001"
                    geometry={nodes.Object_44001.geometry}
                    material={materials["LowPoly.001"]}
                  />
                  <mesh
                    name="Object_44001_1"
                    geometry={nodes.Object_44001_1.geometry}
                    material={materials["GlowG.001"]}
                  />
                  <mesh
                    name="Object_44001_2"
                    geometry={nodes.Object_44001_2.geometry}
                    material={materials["GlowR.001"]}
                  />
                </group>
              </group>

              <group
                name="DESK"
                position={[-1.645, 0.909, 0.769]}
                userData={{ selectable: true }}
              >
                <mesh
                  name="Desk"
                  geometry={nodes.Desk.geometry}
                  material={materials["LowPoly.001"]}
                />
                <group userData={{ selectable: true }} position={[0, 0, 0.5]}>
                  <mesh
                    name="Mug"
                    geometry={nodes.Mug.geometry}
                    material={materials["LowPoly.001"]}
                  />
                </group>
                <group name={"Drawers"} position={[1.65, -0.92, -0.775]}>
                  <group name="Cube006_0" position={[-1.407, 0.567, 1.454]}>
                    <mesh
                      name="Draw2"
                      geometry={nodes.Draw2.geometry}
                      material={materials["LowPoly.001"]}
                    />
                  </group>
                  <group name="Cube007_1" position={[-1.394, 0.755, 1.454]}>
                    <mesh
                      name="Draw1"
                      geometry={nodes.Draw1.geometry}
                      material={materials["LowPoly.001"]}
                    />
                  </group>
                  <group name="Cube009_2" position={[-1.407, 0.366, 1.454]}>
                    <mesh
                      name="Draw3"
                      geometry={nodes.Draw3.geometry}
                      material={materials["LowPoly.001"]}
                    />
                  </group>
                </group>
              </group>
              <group name="Tissues_29" position={[-1.642, 0.64, 0.144]}>
                <mesh
                  name="TissueBox"
                  geometry={nodes.TissueBox.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>

              <group name="WallPaper_42" position={[-1.347, 1.173, 0.409]} />
              <group name="Window_11" position={[-1.952, 2.225, 0.699]}>
                <mesh
                  name="Blinds"
                  geometry={nodes.Blinds.geometry}
                  material={materials["LowPoly.001"]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/low_poly_room_2.glb");
