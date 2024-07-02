<script>
	import { onDestroy, onMount } from 'svelte';
	import uid from '@/utils/uid';

	import DashboardPlot from '@/svelte-components/dashboard/DashboardPlot.svelte';
	import ChartContext from '@/packages/data/ChartContext';
	import ChartOption from '@/packages/data/types/ChartOption';
	import DataType from '@/packages/data/types/DataType';

	export let context;

	// Create local inheritor from the top level context, to have control on the options and ability to destroy it.
	const localContext = new ChartContext(null);

	//localContext.pause = true;

	// Context for the main chart.
	//onst mainChartContext = new ChartContext(localContext);

	// Update parent context when it's changed.
	$: {
		localContext.parent = context;
	}

	// Unique id for the component.
	const componentId = uid('chart-section');

	// Unsubscribe from stores before destroy.
	onDestroy(() => {
		localContext?.destroy();
	});

</script>

<div id="{componentId}" class="section-content" aria-labelledby="{componentId}-heading">
		<div class="plot">
			<DashboardPlot context={localContext} />
		</div>
</div>

<style>
	/* Hide underline of a chart module */
	.plot {
		margin-bottom: -1px;
	}
</style>