<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { classify, PROBLEMS } from '#lib/kb/problems-4471';

  const unique = uniqueById(reports as Report[]);
  const sorted = $derived(classify(unique.filter((r) => r.mergedInto === 4471), tenantOf));
</script>

<p><strong>{unique.length}</strong> unique reports merged into #4471.</p>

<table>
  <thead><tr><th>problem</th><th>reports</th></tr></thead>
  <tbody>
    {#each PROBLEMS as p (p.id)}
      <tr><td>{p.title}</td><td>{sorted[p.id].length}</td></tr>
    {/each}
  </tbody>
</table>
