<script>
	import DashboardCharts from '../DashboardCharts.svelte';
	import DashboardToolbar from '../DashboardToolbar.svelte';

	import ChartContext from '@/packages/data/ChartContext';

	import { getContext } from '@/packages/data/stores/trending';
	
	const context = getContext(ChartContext.GLOBAL);

	// Create page-specific context
	const pageRootContext = new ChartContext(context);
</script>

<DashboardToolbar context={pageRootContext} />
<DashboardCharts context={pageRootContext} />
