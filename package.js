Package.describe({
    name: 'symptomatic:healthgraph',
    version: '0.1.18',
    summary: 'PatientInsight - Accreditation Utility (Cardiac)',
    git: 'https://github.com/symptomatic/healthgraph  ',
    documentation: 'README.md'
});
  
Package.onUse(function(api) {
    api.versionsFrom('1.4');
    
    api.use('meteor-platform');
    api.use('ecmascript');
    api.use('react-meteor-data@0.2.15');
    api.use('session');
    api.use('mongo');

    api.use('clinical:glass-ui@2.1.6');
    api.use('clinical:base-model@1.3.5');

    if(Package['clinical:fhir-vault-server']){
        api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
    }
     
    api.use('clinical:hl7-resource-observation');

    api.use('aldeed:collection2@3.0.0');
    api.use('simple:json-routes@2.1.0');

    api.addFiles('server/methods.js', 'server');
    api.addFiles('server/rest.js', 'server');

    api.addFiles('assets/asclepius.png', "client", {isAsset: true});    
    api.mainModule('index.jsx', 'client');
});


Npm.depends({
    "moment": "2.20.1",
    "lodash": "4.17.4",
    "react": "16.2.0",
    "react-dom": "16.4.1",
    "nivo": "0.31.0",
    'react-katex': '2.0.2',
    "simpl-schema": "1.5.3",
    "fhir-kit-client": "1.4.0"
})