import Sprite from "@/packages/charts/graphics/Sprite"
import ChartContext from "@/packages/data/ChartContext"
import ChartModule from '@/packages/charts/modular/general/chart-module/ChartModule.js';


/**
 * Sprite to be used for charts.
 */
export default class ChartSprite extends Sprite {
    #ui
    #context

    constructor () {
        super()

        this.#ui = this.root.append('g').attr('class', 'ui');
        this.#context = new ChartContext();

    }

    get ui () {
        return this.#ui
    }

    get context () {
        return this.#context
    }

    destroy () {
        super.destroy()
        this.#context.destroy()
    }
}
