// camera.js

class Camera {
    constructor() {
        this.fov = 60;
        this.eye = [0, 0.5, 3];
        this.at = [0, 0, -100];
        this.up = [0, 1, 0];
        this.viewMat = new Matrix4();
        this.viewMat.setLookAt(this.eye[0], this.eye[1], this.eye[2], this.at[0], this.at[1], this.at[2], this.up[0], this.up[1], this.up[2]);
        this.projMat = new Matrix4();
        this.projMat.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    moveForward() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.at = this.at.add(f.mul(0.5));
        this.eye = this.eye.add(f.mul(0.5));
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

    moveBackward() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.at = this.at.sub(f.mul(0.5));
        this.eye = this.eye.sub(f.mul(0.5));
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

    moveLeft() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        var r = new Vector3([0,0,0]);
        r.set(f);
        r = Vector3.cross(f, this.up);
        r = r.normalize();
        this.at = this.at.add(r.mul(0.5));
        this.eye = this.eye.add(r.mul(0.5));
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

    moveRight() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        var r = new Vector3([0,0,0]);
        r.set(f);
        r = Vector3.cross(f, this.up);
        r = r.normalize();
        this.at = this.at.add(r.mul(0.5));
        this.eye = this.eye.add(r.mul(0.5));
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

    panLeft() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        var rotMatrix = new Matrix4();
        rotMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var s = new Vector3([0,0,0]);
        s = rotMatrix.multiplyVector3(f);
        var d = new Vector3([0,0,0]);
        d.set(this.eye);
        this.at = d.add(s);
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

    panRight() {
        var f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(this.eye);
        var rotMatrix = new Matrix4();
        rotMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var s = new Vector3([0,0,0]);
        s = rotMatrix.multiplyVector3(f);
        var d = new Vector3([0,0,0]);
        d.set(this.eye);
        this.at = d.add(s);
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }
}