import Engine from "./engine.js";

const Joint = {transform:{x:0,y:0,z:0},orientation:{x:0,y:0,z:0,w:0},radius:0};

class Hands {
    /**@type {{left:Joint[],right:Joint[]}} */
    static joints = {left: [], right: []};
    static boxes = {left: [], right: []};
    static modelsContainer = null;

    static update(dt) {
        const session = Engine.getXRSession();
        if (session == null) return;
        // retreive hands positions from XRSession
        for (let inputSource of session.inputSources) {
            if (!inputSource.hand) continue;
            this.joints.left = [];
            this.joints.right = [];
            for (const finger of orderedJoints) {
                for (const joint of finger) {
                    let jointPose = Engine.getXRFrame().getJointPose(inputSource.hand.get(joint), Engine.getXRSpace());
                    if (jointPose != null) this.joints[inputSource.handedness].push(jointPose);
                }
            }
        }

        // resize boxes list to match the number of joints
        while (this.boxes.length < this.joints["left"].length+this.joints["right"].length) this.boxes.push(null);
        while (this.boxes.length < this.joints["left"].length+this.joints["right"].length) this.boxes.pop();

        // apply new transform to models
        let i = 0;
        for (side in ["right", "left"]) {
            for(const joint in this.joints[side]) {
                if (this.boxes[side][i] == null) this.boxes[side][i] = this.createBox(joint.radius);
                const box = this.boxes[side][i];
                box.position.copy(joint.transform.position);
                box.orientation.copy(joint.transform.orientation);
                i++;
            }
        }
    }

    static createBox(size) {
        const geometry = new THREE.SphereGeometry( size, 8, 8 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        return new THREE.Mesh( geometry, material );
    }

    static setModelContainer(container) {
        if (this.modelsContainer != null) {
            for(const box of this.boxes.left)
                this.modelsContainer.remove(box);
            for(const box of this.boxes.right)
                this.modelsContainer.remove(box);
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