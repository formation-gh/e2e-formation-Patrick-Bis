const fs = require('node:fs');
const path = require('node:path');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function annotation(test, type) {
  return test.annotations.find((item) => item.type === type)?.description || '';
}

class ReportTableReporter {
  onEnd(result) {
    const reportDirectory = path.resolve('playwright-report');
    fs.mkdirSync(reportDirectory, { recursive: true });

    const rows = this.suite.allTests().map((test) => {
      const finalResult = test.results.at(-1);
      const passed = finalResult?.status === 'passed';
      const functionName = [];
      for (let suite = test.parent; suite && suite.title; suite = suite.parent) {
        functionName.unshift(suite.title);
      }
      const remarks = finalResult?.error?.message || (
        finalResult?.status === 'skipped' ? 'Test ignoré.' : ''
      );

      return `<tr>
        <td>${escapeHtml(functionName.join(' › '))}</td>
        <td>${escapeHtml(test.title)}</td>
        <td>${escapeHtml(annotation(test, 'gherkin')).replaceAll('\n', '<br>')}</td>
        <td>${escapeHtml(annotation(test, 'expected'))}</td>
        <td>${escapeHtml(passed ? 'Résultat conforme aux assertions' : remarks || 'Test non exécuté')}</td>
        <td class="${passed ? 'ok' : 'ko'}">${passed ? 'OK' : 'KO'}</td>
        <td>${escapeHtml(remarks)}</td>
      </tr>`;
    });

    const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Synthèse des tests Playwright</title>
  <style>
    body { font: 14px/1.5 system-ui, sans-serif; margin: 2rem; color: #24292f; }
    h1 { font-size: 1.5rem; }
    .table-wrapper { overflow-x: auto; }
    table { border-collapse: collapse; min-width: 1000px; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: .6rem; text-align: left; vertical-align: top; }
    th { background: #f6f8fa; }
    .ok { color: #1a7f37; font-weight: 700; }
    .ko { color: #cf222e; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Synthèse des tests Playwright</h1>
  <p>Résultat global : ${escapeHtml(result.status)}</p>
  <div class="table-wrapper">
    <table>
      <thead><tr>
        <th>Fonction</th><th>Test</th><th>Gherkin</th><th>Valeur attendue</th>
        <th>valeur obtenue</th><th>Validation OK,KO</th><th>Remarques</th>
      </tr></thead>
      <tbody>${rows.join('\n')}</tbody>
    </table>
  </div>
</body>
</html>`;

    fs.writeFileSync(path.join(reportDirectory, 'tableau-tests.html'), html);
  }

  onBegin(config, suite) {
    this.suite = suite;
  }
}

module.exports = ReportTableReporter;
