import Engine from "./engine.js";

class Physic {
    static physicsUniverse = null;
    static bodies = [];

    static init() {
        return new Promise((resolve, reject) => {
            if (this.initialized) return;
            this.initialized = true;

            Ammo().then(() => {
                this.setup();
                resolve();
            }).catch(reject);
        });
    }

    static setup() {
        var collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache    = new Ammo.btDbvtBroadphase();
        var solver                  = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsUniverse        = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physicsUniverse.setGravity(new Ammo.btVector3(0, -9.81, 0));

        Engine.getScene().add(this.createCube({x: 0, y: 0.675, z: -2}, {x: 1.79, y: 0.024, z: 0.89}, 0));
        Engine.getScene().add(this.createCube({x: 0, y: 1, z: -2}, {x: 0.2, y: 0.2, z: 0.2}, 10));
    }

    static createCube(pos, size, mass, rot={x: 0, y: 0, z: 0, w: 1}) {
        let cube = Engine.createCube(pos, size, 0x47348a);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation( new Ammo.btQuaternion(rot.x, rot.y, rot.z, rot.w));
        const defaultMotionState = new Ammo.btDefaultMotionState(transform);
        
        const localInertia = new Ammo.btVector3( 0, 0, 0 )
        const structColShape = new Ammo.btBoxShape(new Ammo.btVector3(size.x*0.5, size.y*0.5, size.z*0.5));
        structColShape.setMargin(0.01);
        structColShape.calculateLocalInertia(mass, localInertia);
        
        const RBody_Info = new Ammo.btRigidBodyConstructionInfo(mass, defaultMotionState, structColShape, localInertia);
        const RBody = new Ammo.btRigidBody( RBody_Info );

        cube.physicBody = RBody;
        this.physicsUniverse.addRigidBody(RBody);
        this.bodies.push(cube);

        return cube;
    }

    static update(dt) {
        if (!this.physicsUniverse) return;
        this.physicsUniverse.stepSimulation(dt, 10);

        let transform = new Ammo.btTransform();;
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const motionState = body.physicBody.getMotionState();
            if (motionState) {
                motionState.getWorldTransform(transform);
                const pos = transform.getOrigin();
                const rot = transform.getRotation();
                body.position.set(pos.x(), pos.y(), pos.z());
                body.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w());
            }
        }
    }
}

export default Physic;