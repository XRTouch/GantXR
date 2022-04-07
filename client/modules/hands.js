import Engine from "./engine.js";
import Logger from "./logger.js";
import Physic from "./physic.js";
import * as Glove from "./glove.js";

const Joint = {transform:{position: {x:0,y:0,z:0},orientation:{x:0,y:0,z:0,w:0}},radius:0};
export const orderedJoints = [
    ["thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"],
    ["index-finger-metacarpal", "index-finger-phalanx-proximal", "index-finger-phalanx-intermediate", "index-finger-phalanx-distal", "index-finger-tip"],
    ["middle-finger-metacarpal", "middle-finger-phalanx-proximal", "middle-finger-phalanx-intermediate", "middle-finger-phalanx-distal", "middle-finger-tip"],
    ["ring-finger-metacarpal", "ring-finger-phalanx-proximal", "ring-finger-phalanx-intermediate", "ring-finger-phalanx-distal", "ring-finger-tip"],
    ["pinky-finger-metacarpal", "pinky-finger-phalanx-proximal", "pinky-finger-phalanx-intermediate", "pinky-finger-phalanx-distal", "pinky-finger-tip"]
];

class Hands {
    /**@type {{left:Joint[],right:Joint[]}} */
    static joints = {left: [], right: []};
    static boxes = {left: [], right: []};
    static modelsContainer = null;

    static colliders = [];
    static indexBox = null;

    static update(dt) {
        const session = Engine.getXRSession();
        const space = Engine.getXRSpace();
        if (!session || !space) return;
        // retreive hands positions from XRSession
        this.joints.left = [];
        this.joints.right = [];
        for (let inputSource of session.inputSources) {
            if (!inputSource.hand) continue;
            for (const finger of orderedJoints) {
                for (const joint of finger) {
                    const jointID = inputSource.handedness + joint;
                    let jointPose = Engine.getXRFrame().getJointPose(inputSource.hand.get(joint), space);
                    if (!jointPose) continue;
                    
                    this.joints[inputSource.handedness].push(jointPose);
                    if (joint.endsWith("tip")) {
                        let index = this.colliders.findIndex(c => c.id == jointID);
                        if (index == -1) {
                            const target = Physic.createTarget({x: 0, y: 0, z: 0}, {x: 0.020, y: 0.020, z: 0.020});
                            const collider = Physic.createCube({x: 0, y: 0, z: 0}, {x: 0.020, y: 0.020, z: 0.020}, 1);
                            target.physicBody.setActivationState(4);
                            target.physicBody.setCollisionFlags(4 | 2);

                            const targetTransform = new Ammo.btTransform();
                            targetTransform.setIdentity();
                            targetTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
                            const colliderTransform = new Ammo.btTransform();
                            colliderTransform.setIdentity();
                            targetTransform.setOrigin(new Ammo.btVector3(0, 0, 0));

                            const spring = new Ammo.btGeneric6DofSpringConstraint(
                                target.physicBody,
                                collider.physicBody,
                                targetTransform,
                                colliderTransform,
                                true
                            );
                            Physic.getWorld().addConstraint(spring, false);

                            Engine.getScene().add(collider);
                            this.colliders.push({id: jointID, target: target, spring: spring, collider: collider});
                            index = this.colliders.length - 1;
                        }
                        let trans = new Ammo.btTransform();
                        trans.setOrigin(new Ammo.btVector3(
                            jointPose.transform.position.x + Engine.getPlayer().position.x,
                            jointPose.transform.position.y + Engine.getPlayer().position.y,
                            jointPose.transform.position.z + Engine.getPlayer().position.z
                        ));
                        trans.setRotation(new Ammo.btQuaternion(
                            jointPose.transform.orientation.x,
                            jointPose.transform.orientation.y,
                            jointPose.transform.orientation.z,
                            jointPose.transform.orientation.w
                        ));
                        this.colliders[index].target.physicBody.getMotionState().setWorldTransform(trans);
                        
                        if (joint == "index-finger-tip" && inputSource.handedness == "right") {
                            const newPos = {
                                x: jointPose.transform.position.x + Engine.getPlayer().position.x,
                                y: jointPose.transform.position.y + Engine.getPlayer().position.y,
                                z: jointPose.transform.position.z + Engine.getPlayer().position.z
                            }
                            const curPos = this.colliders[index].collider.position;
                            const force = Math.sqrt(
                                Math.pow(newPos.x - curPos.x, 2) +
                                Math.pow(newPos.y - curPos.y, 2) +
                                Math.pow(newPos.z - curPos.z, 2)
                            ) * 20;
                            Glove.setIndexForce(Math.min(Math.max(force, 0), 1));
                        }
                    }
                }
            }
        }

        for (const side of ["right", "left"]) {
            // resize boxes list to match the number of joints
            while (this.boxes[side].length < this.joints[side].length) this.boxes[side].push(null);
            while (this.boxes[side].length < this.joints[side].length) this.boxes[side].pop();

            // apply new transform to models
            let i = 0;
            for(const joint of this.joints[side]) {
                if (!this.boxes[side][i]) {
                    this.boxes[side][i] = Engine.createCube({x: 0, y: 0, z: 0}, {x: 0.02, y: 0.02, z: 0.02}, 0xff0000);
                    this.modelsContainer?.add(this.boxes[side][i]);
                }
                const box = this.boxes[side][i];
                box.position.copy(joint.transform.position);
                box.quaternion.copy(joint.transform.orientation);
                i++;
            }
        }
    }

    static setModelContainer(container) {
        if (this.modelsContainer != null) {
            for(const box of this.boxes.left)
                this.modelsContainer.remove(box);
            for(const box of this.boxes.right)
                this.modelsContainer.remove(box);
            this.modelsContainer.remove(this.indexBox);
        }
        this.modelsContainer = container;
        for(const box of this.boxes.left)
            this.modelsContainer.add(box);
        for(const box of this.boxes.right)
            this.modelsContainer.add(box);
    }

    static getJoints() {
        return this.joints;
    }
}

export default Hands;