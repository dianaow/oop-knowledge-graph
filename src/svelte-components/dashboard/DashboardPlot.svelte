<script>
	import { onMount, onDestroy } from 'svelte';
	import ChartContext from '@/packages/data/ChartContext';
	import ChartModule from '@/packages/charts/modular/general/chart-module/ChartModule';

	export let context;

	let targetEl;

	let plotInstance = null;

	let resizeObserver;

	const localContext = new ChartContext(context);

	onMount(() => {
		plotInstance = new ChartModule();
		targetEl.appendChild(plotInstance.root.node());
		plotInstance.width = targetEl.clientWidth;
		plotInstance.height = targetEl.clientHeight;
		plotInstance.context.parent = localContext;

		// Update modules on resize.
		resizeObserver = new ResizeObserver(() => {
			if (targetEl) {
				plotInstance.width = targetEl.clientWidth;
			}
		});

		resizeObserver.observe(targetEl);

	});


	// Remove component connections before destroy.
	onDestroy(() => {
		resizeObserver?.disconnect();
		plotInstance?.destroy();
		localContext?.destroy();
	});
</script>

<div class="chart">
	<div class="plot-container" bind:this={targetEl} />
</div>

<style>
	.chart {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
	}

	.plot-container {
		grid-column-start: 1;
		grid-column-end: 3;
		grid-row-start: 1;
		grid-row-end: 2;
	}
</style>

