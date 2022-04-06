import Engine from "./engine.js";

class Physic {
    static physicsUniverse = null;
    static bodies = [];
    static toys = [];

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

        this.createCube({x: 0, y: 0.675, z: -2}, {x: 1.79, y: 0.024, z: 0.89}, 0);

        for (let i = 0; i < 10; i++) {
            const size = Math.random() * 0.08 + 0.02;
            const toy = this.createCube({x: Math.random()*0.4-0.2, y: 1, z: -1.8+Math.random()*0.4}, {x: size, y: size, z: size}, size*50, 0x444444);
            this.toys.push(toy);
            Engine.getScene().add(toy);
        }
    }

    static createCube(pos, size, mass, color=0xffffff, rot={x: 0, y: 0, z: 0, w: 1}) {
        let cube = Engine.createCube(pos, size, color);

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

        let index = 0;
        for(const toy of this.toys) {
            if (toy.position.y < -1) {
                Engine.getScene().remove(toy);
                this.toys.splice(index, 1);
                const size = Math.random() * 0.05 + 0.05;
                const posZ = -1.9 + Math.random() * 0.2;
                const posX = Math.random() * 0.2;
                const newtoy = this.createCube({x: posX, y: 1, z: posZ}, {x: size, y: size, z: size}, size*50, 0x444444);
                this.toys.push(newtoy);
                Engine.getScene().add(newtoy);
                break;
            }
            index++;
        }

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