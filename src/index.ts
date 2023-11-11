import '../styles.css';
import {Scene} from './scene';

const scene = new Scene();

scene.setPivot(300,0);

scene.setCoordinates(
    [
        [301, 55],
        [272, 65, 265, 85, 265, 85],
        [261, 103, 261, 131, 261, 131],
        [263, 145, 270, 163, 270, 163],
        [270, 163, 287, 184, 301, 184]
    ]
);

scene.draw();
