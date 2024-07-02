<script>;
	import ChartOption from '@/packages/data/types/ChartOption';

	export let context;
	
  function showMapHandler() {
    context.set(ChartOption.VIEW_STATE, 'map')
	}

	function showRegionalTreeHandler() {
    context.set(ChartOption.VIEW_STATE, 'region-tree')
	}

	function showAllHandler() {
    context.set(ChartOption.VIEW_STATE, 'all-tree')
	}
</script>

<div class="container-fluid chart-navigation" style="height: 30px;">
	<div class="row bg-gray-800 align-items-center border-bottom pe-3 h-100 flex-nowrap">
		<div class="col text-white fs-xs">
				<div class="responsive hstack gap-2">
          <button type="button" class="btn btn-dark" data-bs-toggle="tooltip" data-bs-placement="top" on:click={showMapHandler}>Show map</button>
					<button type="button" class="btn btn-dark" data-bs-toggle="tooltip" data-bs-placement="top" on:click={showRegionalTreeHandler}>Show regional tree</button>
					<button type="button" class="btn btn-dark" data-bs-toggle="tooltip" data-bs-placement="top" on:click={showAllHandler}>Show all nodes</button>
					Click on an entity to view child entites and connections. 
				</div>
		</div>
	</div>
</div>

<style>

	:global(.chart-navigation .btn-check:checked + .btn) {
		background-color: var(--bs-gray-950);
		border-color: transparent;
	}

	:global(.chart-navigation .btn-check:not(:checked) + .btn:hover) {
		background-color: var(--bs-gray-700) !important;
		border-color: transparent;
	}

	.chart-navigation > .row {
		border-top-left-radius: 0.25rem;
	}

	.responsive {
		width: max-content;
	}
</style>