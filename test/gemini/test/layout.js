var gemini = require('gemini');

gemini.suite('layout', function(suite) {
    suite.setUrl('/test/layout.html')
        .setCaptureElements('.page-content')
        .capture('page')
});