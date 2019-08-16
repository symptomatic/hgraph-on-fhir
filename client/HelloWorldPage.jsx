import { CardMedia, CardText, CardTitle, CardHeader, RaisedButton } from 'material-ui';
import { GlassCard, FullPageCanvas, Glass } from 'meteor/clinical:glass-ui';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';

import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

import Client from 'fhir-kit-client';

console.log('Intitializing fhir-kit-client for ' + get(Meteor, 'settings.public.interfaces.default.channel.endpoint', ''))
const client = new Client({
  baseUrl: get(Meteor, 'settings.public.interfaces.default.channel.endpoint', '')
});

Session.setDefault('displayText', '');
Session.setDefault('measuresArray', [{
  identifier: "CM.M12a",
  description: "Proportion of patients receiving Echocardiogram",
  score: 0
}, {
  identifier: "CM.M12b",
  description: "Proportion of patients receiving Cardiac MRI",
  score: 0
}, {
  identifier: "CM.M12c",
  description: "Proportion of patients receiving Endoscopy",
  score: 0
}, {
  identifier: "CM.M12d",
  description: "Proportion of patients receiving Coronary Angiography",
  score: 0
}]);
Session.setDefault('activeMeasure', {});
Session.setDefault('showJson', false);
Session.setDefault('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001&apikey=');


// 40701008   Echocardiogram
// 241620005  Cardiac MRI

export class HelloWorldPage extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {

    let imgHeight = (Session.get('appHeight') - 210) / 3;

    let data = {
      style: {
        page: {},
        coverImg: {
          maxWidth: 'inherit',
          maxHeight: 'inherit',
          height: 'inherit'
        },
        cards: {
          media: {
            height: (imgHeight - 1) + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          practitioners: {
            cursor: 'pointescale-downr',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          organizations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          locations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          }
        },
        inactiveIndexCard: {
          opacity: .5,
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px'
        },
        tile: {
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px',
          marginBottom: '20px',
          height: imgHeight + 'px'
        },
        spacer: {
          display: 'block'
        },
        title: Glass.darkroom(),
        subtitle: Glass.darkroom()
      },
      organizations: {
        image: "/pages/provider-directory/organizations.jpg"
      },
      displayText: Session.get('displayText'),
      measures: Session.get('measuresArray'),
      showJson: Session.get('showJson'),
      endpoint: get(Meteor, 'settings.public.interfaces.default.channel.endpoint', ''),
      apiKey: get(Meteor, 'settings.public.interfaces.default.auth.username', ''),
      fhirQueryUrl: Session.get('fhirQueryUrl')
    };


    data.style.indexCard = Glass.darkroom(data.style.indexCard);

    if (Session.get('appWidth') < 768) {
      data.style.inactiveIndexCard.width = '100%';
      data.style.inactiveIndexCard.marginBottom = '10px';
      data.style.inactiveIndexCard.paddingBottom = '10px';
      data.style.inactiveIndexCard.paddingLeft = '0px';
      data.style.inactiveIndexCard.paddingRight = '0px';

      data.style.spacer.display = 'none';
    }

    if(Session.get('appHeight') > 1200){
      data.style.page = {
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'relative'
      }
    }

    if(process.env.NODE_ENV === "test") console.log("HelloWorldPage[data]", data);
    return data;
  }
  toggleDisplayJson(){
    Session.toggle('showJson');
  }
  fetchMetadata(fhirClient){
    console.log('fetchMetadata')
    console.log('fhirClient', fhirClient)

    console.log('fhirClient.smartAuthMetadata()', fhirClient.smartAuthMetadata())
    fhirClient.smartAuthMetadata().then((response) => {
      console.log('smartAuthMetadata', response);
    });
    fhirClient.capabilityStatement().then((data) => {
      console.log('capabilityStatement', data);
      Session.set('displayText', data);
    });  

    // console.log('metadataAutoscan....');
    // Meteor.call('metadataAutoscan', Session.get('oauthBaseUrl'), function(error, result){
    //   if(result){
    //     console.log('result', result)
    //     Session.set('displayText', result)
    //   }
    // })

  }
  async queryEndpoint(scope, modality){
    console.log('queryEndpoint')

    await Meteor.call("queryEndpoint", scope.data.endpoint + scope.data.fhirQueryUrl + scope.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
      console.log('result', parsedResults)
      // console.log('content', parsedResults)
      Session.set('displayText', parsedResults);

      let measures = Session.get('measuresArray');
      switch (modality) {
        case "endoscopy":
          measures[2].numerator = parsedResults.total;
          measures[2].denominator = parsedResults.total;
          measures[2].score =  ((measures[2].numerator /  measures[2].denominator) * 100) + '%';
          break;
        case "mri":
          measures[1].numerator = parsedResults.total;
          measures[1].denominator = parsedResults.total;
          measures[1].score = (( measures[1].numerator /  measures[1].denominator) * 100) + '%';
          break;
        case "echo":
          measures[0].numerator = parsedResults.total;
          measures[0].denominator = parsedResults.total;
          measures[0].score = (( measures[0].numerator /  measures[0].denominator) * 100) + "%";
          break;
        case "angio":
          measures[3].numerator = parsedResults.total;
          measures[3].denominator = parsedResults.total;
          measures[3].score = (( measures[3].numerator /  measures[3].denominator) * 100) + "%";
          break;
        case "patient":
          measures[0].denominator = parsedResults.total;
          measures[1].denominator = parsedResults.total;
          measures[2].denominator = parsedResults.total;
          measures[3].denominator = parsedResults.total;

          measures[0].score = (( measures[0].numerator /  measures[0].denominator) * 100) + "%";
          measures[1].score = (( measures[1].numerator /  measures[1].denominator) * 100) + "%";
          measures[2].score = (( measures[2].numerator /  measures[2].denominator) * 100) + "%";
          measures[3].score = (( measures[3].numerator /  measures[3].denominator) * 100) + "%";
          break;
                
        default:
          break;
      }
      Session.set('measuresArray', measures);
    })

  }
  queryEndoscopy(){
    console.log('queryEndoscopy')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001&apikey=');
    this.queryEndpoint(this, 'endoscopy');
  }
  queryEchocardiograms(){
    console.log('queryEchocardiograms')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=40701008&apikey=');
    this.queryEndpoint(this, 'echo');
  }
  queryAngiography(){
    console.log('queryAngiography')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=33367005&apikey=');
    this.queryEndpoint(this, 'angio');
  }
  queryMris(){
    console.log('queryMris')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=241620005&apikey=');
    this.queryEndpoint(this, 'mri');
  }
  queryPatients(){
    console.log('queryPatients')
    Session.set('fhirQueryUrl', '/Patient?apikey=');
    this.queryEndpoint(this, 'patient');
  }
  rowClick(){
    console.log('rowClick')
  }
  render() {
    let tableRows = [];
    for (var i = 0; i < this.data.measures.length; i++) {

      let rowStyle = {
        cursor: 'pointer',
        textAlign: 'left'
      }


      tableRows.push(
        <tr key={i} className="patientRow" style={rowStyle} onClick={ this.rowClick.bind(this, this.data.measures[i]._id)} >
          <td>{this.data.measures[i].identifier }</td>
          <td>{this.data.measures[i].description }</td>
          <td>{ this.data.measures[i].numerator }</td>
          <td>{ this.data.measures[i].denominator }</td>
          <td>{ this.data.measures[i].score }</td>
          <td>{ this.data.measures[i].passfail }</td>
        </tr>
      );
    }

    let codeSection;

    if(this.data.showJson){
      codeSection = <pre style={{height: '200px', backgroundColor: "#eeeeee", border: '1px dashed gray', padding: '10px', marginTop: '10px', marginBottom: '10px'}}>
        { JSON.stringify(this.data.displayText, null, ' ')  }
      </pre>
    }


    return (
      <div id='indexPage'>
        <FullPageCanvas>
          <GlassCard height='auto'>
            <CardTitle 
              title="Accreditation Scorecard" 
              subtitle="Cardiac Measures"
              style={{fontSize: '100%'}} />
            <CardText style={{fontSize: '100%'}}>
              
             <h4 className="helveticas">{ this.data.endpoint + this.data.fhirQueryUrl + this.data.apiKey }</h4><br />
             <RaisedButton label="Metadata" onClick={this.fetchMetadata.bind(this, client)} style={{marginRight: '20px'}} />      
             <RaisedButton label="Show JSON" onClick={this.toggleDisplayJson.bind(this)} style={{marginRight: '20px'}} />

             <RaisedButton label="Query Patients" onClick={this.queryPatients.bind(this)} style={{marginRight: '20px'}} />             

             <RaisedButton label="Query Endoscopy" onClick={this.queryEndoscopy.bind(this)} style={{marginRight: '20px'}} />             
             <RaisedButton label="Query Echocardiograms" onClick={this.queryEchocardiograms.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Angiography" onClick={this.queryAngiography.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Cardiac MRIs" onClick={this.queryMris.bind(this)} /><br /><br />


              { codeSection }
              
              <Table hover >
                <thead>
                  <tr>
                    <th>Identifier</th>
                    <th>Measure Description</th>
                    <th>Numerator</th>
                    <th>Denominator</th>
                    <th>Score</th>
                    <th>Pass / Fail</th>
                  </tr>
                </thead>
                <tbody>
                  { tableRows }
                </tbody>
              </Table>
 
            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }




  openLink(url){
    console.log("openLink", url);
    browserHistory.push(url);
  }
}



ReactMixin(HelloWorldPage.prototype, ReactMeteorData);

export default HelloWorldPage;