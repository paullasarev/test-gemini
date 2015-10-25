var gemini = require('gemini');

gemini.suite('layout', function(suite) {
    suite.setUrl('/layout.html')
        .setCaptureElements('.page-content')
        .capture('page')
});