Package.describe({
    name: 'symptomatic:healthgraph-on-fhir',
    version: '0.2.1',
    summary: 'PatientInsight - Accreditation Utility (Cardiac)',
    git: 'https://github.com/symptomatic/healthgraph  ',
    documentation: 'README.md'
});
  
Package.onUse(function(api) {
    api.versionsFrom('1.4');
    
    api.use('meteor-base@1.4.0');
    api.use('ecmascript@0.13.0');
    api.use('react-meteor-data@0.2.15');
    api.use('session');
    api.use('mongo');
    api.use('http');
    api.use('ejson');
    api.use('random');

    if(Package['clinical:fhir-vault-server']){
        api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
    }
     
    api.use('aldeed:collection2@3.0.0');
    api.use('simple:json-routes@2.1.0');
    api.use('clinical:hl7-fhir-data-infrastructure@6.5.2');

    api.addFiles('server/methods.js', 'server');
    api.addFiles('server/rest.js', 'server');

    api.addFiles('lib/Collections.js');
    

    api.addFiles('assets/asclepius.png', "client", {isAsset: true});    
    api.mainModule('index.jsx', 'client');
});


Npm.depends({
    "moment": "2.20.1",
    "lodash": "4.17.4",
    "react": "16.12.0",
    "react-dom": "16.12.0",
    "simpl-schema": "1.5.3",
    "hgraph-react": "0.0.7",
    "d3-scale": "3.0.1"
})