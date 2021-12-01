const canvas = document.querySelector('.webgl');
score = document.getElementById('scoring');

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000);

camera.position.z += 100;

let renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", function() {
    renderer.setSize(this.window.innerWidth, this.window.innerHeight);
    camera.aspect = this.window.innerWidth/this.window.innerHeight;
   
    camera.updateProjectionMatrix();
});

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
directionalLight.position.set(0, 50, 0);
scene.add(directionalLight);

const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 8, 0xffffff);
scene.add(lightHelper);

const colors = [
    0xf1eb3c,  //kuning
    0xf23d6d,  //merah
    0x975ddc,  //ungu
    0x43e9e9,  //biru muda
    0x78f92d,  //hijau muda
    0x4c4cc9,  //biru tua
];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomCertainFloat(min, max) {
    return Math.random() * (max - min) + min;
}

let boxCount = 0;

let speed = 1000;
const speedMin = 200;
const speedAdd = 200;

const makeBox = () => {
    let cubeGeo = new THREE.BoxGeometry(3, 3, 3);
    let cubeMat = new THREE.MeshToonMaterial({ color:randomColor() });
    let cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(randomCertainFloat(-30, 30), randomCertainFloat(-30, 30), randomCertainFloat(-30, 30));
    scene.add(cubeMesh);
    boxCount += 1;
    cubeMesh.name = `box${boxCount}`;

    return cubeMesh;
}

const addBox = (num) => {
    if(boxCount <= 99) {
        Array(num).fill(0).forEach(makeBox);
        if(speed >= speedMin + speedAdd) {
            speed -= speedAdd;
        }
        console.log(`box added, box ${boxCount}, speed ${speed}`);
    }

    setTimeout(addBox, speed);
}

addBox();

let rayCast = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selected, selectBox;

const deselect = () => {
    if (selected == null) {
        return;
    }
    selected.obj.material.color.setHex(selected.init_color);
    selected = null;
    selectBox = undefined;
};


const ereaseBox = (object) => {
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
    renderer.renderLists.dispose();
};

const selectedBox = (once = false) => {
    if (selected) {
        const currentColor = selected.obj.material.color.getHex();
        selected.obj.material.color.setHex((currentColor === 0xffffff)?selected.init_color: 0xffffff);
    }
    if (once) {
        return;
    } 
    setTimeout(selectedBox, 100);
};

document.addEventListener("mousedown", (e) => {
    mouse.x = (e.clientX/window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY/window.innerHeight) *-2 + 1;
    rayCast.setFromCamera(mouse, camera);

    let intersects = rayCast.intersectObjects(scene.children, false);
     
    intersects.forEach((i)=> {
        if(i.object.name != "") {
            selectBox = i.object;
        }
    })

    if (!intersects[0]) {
        deselect();
        return;
    }
    let firstObject = intersects[0].object;

    if (selected != null) {
        evaluateObject(firstObject);
        return;
    }

    selected = ({
        obj: firstObject,
        init_color: firstObject.material.color.getHex()
    });
    selectedBox(true);
});

const evaluateObject = (chObject) => {
    if (selected.obj.uuid === chObject.uuid) {
        return;
    }

    const first  = selected.init_color;
    const second = chObject.material.color.getHex();

    const currentScore = parseInt(score.textContent);
    
    let newScore;
    
    if (first === second) {
        ereaseBox(selected.obj);
        ereaseBox(chObject);
        boxCount -= 2;
        newScore = currentScore + 20;
        console.log('paired box erased');
    } 
    score.textContent = '' + ((newScore >= 0) ? newScore : 0);
    deselect();
};
 
document.addEventListener('mousedown', () => {
    document.querySelector('html').classList.toggle('cursor');
});

document.addEventListener('mouseup', () => {
    document.querySelector('html').classList.toggle('cursor');
});

selectedBox();

function update() {
    renderer.render(scene, camera);
    
    if(selectBox != undefined) {
        selectBox.rotation.y += 0.1;
    }

    controls.update();

    requestAnimationFrame(update);
}

update();