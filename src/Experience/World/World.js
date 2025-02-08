import Experience from '../Experience.js'
import Environment from './Environment.js'
import Particles from './Particles.js'
import Stage from './Stage.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.stage = new Stage()

        this.resources.on('ready', () => {
            // Load default environment and particles
            this.particles = new Particles()
            this.environment = new Environment()
        })
    }

    loadStage(stageNumber) {
        // Load a specific stage
        this.stage.loadStage(stageNumber)
    }

    update() {
        if (this.stage) {
            this.stage.update()
        }
        if (this.particles) {
            this.particles.update()
        }
    }
}
